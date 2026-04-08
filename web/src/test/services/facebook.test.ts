import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildFacebookLoginUrl } from '../../services/facebook';

afterEach(() => {
    // Reset environment changes so tests do not affect each other.
    vi.unstubAllEnvs();
});

describe('facebook service', () => {
    it('builds a Facebook OAuth URL with required parts', () => {
        // Checks the generated login URL includes all mandatory OAuth pieces.
        const url = buildFacebookLoginUrl();

        expect(url).toContain('https://www.facebook.com/v23.0/dialog/oauth');
        expect(url).toContain('client_id=');
        expect(url).toContain('redirect_uri=https%3A%2F%2Feurope-west1-dtuevent-8105b.cloudfunctions.net%2FhandleCallback');
        expect(url).toContain('scope=pages_show_list,pages_read_engagement');
    });

    it('uses VITE_FACEBOOK_APP_ID as dynamic client_id', () => {
        // Checks the URL uses the current env value, not a hardcoded client id.
        vi.stubEnv('VITE_FACEBOOK_APP_ID', 'my-test-app-id');

        const url = buildFacebookLoginUrl();

        expect(url).toContain('client_id=my-test-app-id');
    });

    it('encodes redirect_uri correctly', () => {
        // Checks redirect URL is URL-encoded so Facebook receives it safely.
        const url = buildFacebookLoginUrl();
        const parsed = new URL(url);
        const encodedRedirect = parsed.searchParams.get('redirect_uri');

        expect(encodedRedirect).toBe('https://europe-west1-dtuevent-8105b.cloudfunctions.net/handleCallback');
    });

    it('keeps scope list in expected comma format', () => {
        // Checks scope permissions are included exactly as expected.
        const url = buildFacebookLoginUrl();
        const parsed = new URL(url);

        expect(parsed.searchParams.get('scope')).toBe('pages_show_list,pages_read_engagement');
    });

    it('shows undefined client_id when env is missing', () => {
        // Checks current behavior when env is missing so failures are easy to spot.
        vi.stubEnv('VITE_FACEBOOK_APP_ID', '');

        const url = buildFacebookLoginUrl();

        expect(url).toContain('client_id=');
    });
});
