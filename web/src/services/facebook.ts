import { FB_OAUTH_BASE_URL, FB_SCOPES, FB_CALLBACK_PATH } from '../constants';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '';

export function buildFacebookLoginUrl(): string {
    const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string;
    const BACKEND_BASE_URL = BACKEND_URL || window.location.origin;
    const FB_REDIRECT_URI = encodeURIComponent(`${BACKEND_BASE_URL}${FB_CALLBACK_PATH}`);
    return `${FB_OAUTH_BASE_URL}?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=${FB_SCOPES}`;
}

export async function getFacebookAuthUrl(token: string): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/facebook/auth`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((body['message'] as string | undefined) ?? 'Failed to get Facebook auth URL');
    }

    const data = await response.json() as { url: string; state: string };
    return data.url;
}
