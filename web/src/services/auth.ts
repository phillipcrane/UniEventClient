import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, type User } from 'firebase/auth';
import { getAuthInstance } from './firebase';

export type AuthUser = User;

type SignupInput = {
    username: string;
    email: string;
    password: string;
};

export async function loginWithEmail(email: string, password: string) {
    const auth = getAuthInstance();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function signupWithEmail({ username, email, password }: SignupInput) {
    const auth = getAuthInstance();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedUsername = username.trim();

    if (trimmedUsername) {
        await updateProfile(credential.user, { displayName: trimmedUsername });
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

export function mapAuthError(error: unknown): string {
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
