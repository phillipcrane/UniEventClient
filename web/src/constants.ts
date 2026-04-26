// Timing
export const SEARCH_DEBOUNCE_MS = 250;
export const FEEDBACK_TOAST_MS = 1500;
export const CLIPBOARD_FEEDBACK_MS = 1400;
export const NEW_EVENT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

// Pagination
export const DEFAULT_PAGE_SIZE = 100;

// Calendar
export const CALENDAR_MAX_EVENT_SPAN_DAYS = 30;
export const CALENDAR_EVENTS_PER_DAY = 3;

// Locale
export const APP_LOCALE = 'da-DK';

// DAL
export const DEFAULT_EVENTS_SORT = 'startTime,asc';

// Storage keys
export const STORAGE_KEY_TOKEN = 'unievent_token';
export const STORAGE_KEY_USER = 'unievent_user';
export const STORAGE_KEY_LIKES = (uid: string) => `unievent_likes_${uid}`;
export const STORAGE_KEY_THEME = 'ui-theme';

// Theme
export const THEME_DARK = 'dark';
export const THEME_LIGHT = 'light';

// Custom DOM events
// Facebook OAuth
export const FB_GRAPH_VERSION = 'v25.0';
export const FB_OAUTH_BASE_URL = `https://www.facebook.com/${FB_GRAPH_VERSION}/dialog/oauth`;
export const FB_SCOPES = 'pages_show_list,pages_read_engagement';
export const FB_CALLBACK_PATH = '/api/facebook/callback';

// Identity
export const ICS_PRODID = 'UniEventClient';
export const ICS_UID_DOMAIN = 'unievent';
