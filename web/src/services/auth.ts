import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, type User } from 'firebase/auth';
import { db, getAuthInstance } from './firebase';
import type { FieldValue, Timestamp } from 'firebase/firestore';

function isFirestoreEnabled(): boolean {
    return import.meta.env.VITE_USE_FIRESTORE?.toLowerCase() === 'true';
}

const USER_LIKES_COLLECTION = 'users';

export type AuthUser = User;
type AuthErrorContext = 'login' | 'signup' | 'general';
export type AccountRole = 'user' | 'organizer';

export type UserDto = {
    uid: string;
    name: string;
    email: string;
    organizer: boolean;
    /** @deprecated Legacy misspelled field kept temporarily for backward compatibility with older Firestore documents. */
    orgenizer?: boolean;
    role?: AccountRole;
    createdAt: Timestamp | null;
    likedItemIds: string[];
    organizerNames?: string[];
};

export type AccountProfile = {
    role: AccountRole;
    organizerNames: string[];
};

const accountProfileCache = new Map<string, AccountProfile>();

type SignupInput = {
    username: string;
    email: string;
    password: string;
    role?: AccountRole;
    organizerNames?: string[];
};

function normalizeAccountRole(value: unknown): AccountRole {
    return value === 'organizer' ? 'organizer' : 'user';
}

function normalizeOrganizerNames(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((name) => (typeof name === 'string' ? name.trim() : ''))
        .filter((name): name is string => !!name);
}

function buildProfilePayload(role: unknown, organizerNames: unknown): AccountProfile {
    return {
        role: normalizeAccountRole(role),
        organizerNames: normalizeOrganizerNames(organizerNames),
    };
}

function saveAccountProfileInMemory(uid: string, profile: AccountProfile) {
    accountProfileCache.set(uid, profile);
}

export async function getAccountProfile(uid: string | null | undefined): Promise<AccountProfile> {
    if (!uid) {
        return { role: 'user', organizerNames: [] };
    }

    const fallbackProfile = accountProfileCache.get(uid) ?? { role: 'user', organizerNames: [] };

    if (!isFirestoreEnabled()) {
        return fallbackProfile;
    }

    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, USER_LIKES_COLLECTION, uid));

        if (userDoc.exists()) {
            const data = userDoc.data() as Record<string, unknown>;
            const role = data.role ?? (data.organizer === true || data.orgenizer === true ? 'organizer' : 'user');
            const firestoreProfile = buildProfilePayload(role, data.organizerNames);
            saveAccountProfileInMemory(uid, firestoreProfile);
            return firestoreProfile;
        }
    } catch {
        // If Firestore read fails, keep using memory fallback.
    }

    return fallbackProfile;
}

export function getStoredAccountRole(uid: string | null | undefined): AccountRole {
    if (!uid) {
        return 'user';
    }

    return accountProfileCache.get(uid)?.role ?? 'user';
}

export function getStoredOrganizerNames(uid: string | null | undefined): string[] {
    if (!uid) {
        return [];
    }

    return accountProfileCache.get(uid)?.organizerNames ?? [];
}

export async function loginWithEmail(email: string, password: string) {
    const auth = getAuthInstance();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function signupWithEmail({ username, email, password, role = 'user', organizerNames = [] }: SignupInput) {
    const auth = getAuthInstance();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedUsername = username.trim();
    const profile = buildProfilePayload(role, organizerNames);

    if (trimmedUsername) {
        await updateProfile(credential.user, { displayName: trimmedUsername });
    }

    if (credential.user?.uid) {
        saveAccountProfileInMemory(credential.user.uid, profile);

        if (isFirestoreEnabled()) {
            const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
            const userDoc: Omit<UserDto, 'createdAt'> & { createdAt: Timestamp | FieldValue } = {
                uid: credential.user.uid,
                name: trimmedUsername || credential.user.displayName || '',
                email: credential.user.email || email,
                organizer: profile.role === 'organizer',
                role: profile.role,
                createdAt: serverTimestamp(),
                likedItemIds: [],
                organizerNames: profile.organizerNames,
            };

            await setDoc(doc(db, USER_LIKES_COLLECTION, credential.user.uid), userDoc, { merge: true });
        }
    }

    return credential.user;
}

export function onAuthUserChanged(callback: (user: AuthUser | null) => void) {
    const auth = getAuthInstance();
    return onAuthStateChanged(auth, callback);
}

export async function signOutCurrentUser() {
    const auth = getAuthInstance();
    await signOut(auth);
}

export function mapAuthError(error: unknown, context: AuthErrorContext = 'general'): string {
    if (error instanceof Error && error.message.includes('Missing Firebase env variables:')) {
        return error.message;
    }

    if (error instanceof Error && error.message.includes('auth/invalid-api-key')) {
        return 'Firebase Auth is not configured correctly (invalid API key).';
    }

    if (!(error instanceof FirebaseError)) {
        return 'Something went wrong. Please try again.';
    }

    switch (error.code) {
        case 'auth/operation-not-allowed':
            return 'Email/password sign-in is disabled in Firebase Authentication. Enable it in Firebase Console -> Authentication -> Sign-in method.';
        case 'auth/configuration-not-found':
            return 'Authentication provider configuration is missing in Firebase Console.';
        case 'auth/invalid-email':
            if (context === 'login') {
                return 'Invalid email or password.';
            }
            return 'The email address is invalid.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'This email is already in use.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        case 'auth/admin-restricted-operation':
            return 'This operation is restricted by Firebase project settings.';
        case 'auth/unauthorized-domain':
            return 'Current domain is not authorized for Firebase Auth. Add localhost in Firebase Console -> Authentication -> Settings -> Authorized domains.';
        default:
            return `Authentication failed (${error.code}). Please verify Firebase Authentication settings.`;
    }
}
