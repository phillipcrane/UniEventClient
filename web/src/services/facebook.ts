const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '';

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
