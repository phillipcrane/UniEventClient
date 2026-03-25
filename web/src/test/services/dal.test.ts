import { describe, expect, it, vi, beforeEach } from 'vitest';

// Fake Firestore helpers so we can test behavior without real network/database calls.
const mockDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockCollection = vi.fn();
const mockGetDocs = vi.fn();
const mockOrderBy = vi.fn();
const mockQuery = vi.fn();

// Replace real firebase db object with a predictable fake one.
vi.mock('../../services/firebase', () => ({
    db: { name: 'fake-db' },
}));

// Replace Firestore SDK methods with controllable test doubles.
vi.mock('firebase/firestore', () => ({
    doc: (...args: unknown[]) => mockDoc(...args),
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    collection: (...args: unknown[]) => mockCollection(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    orderBy: (...args: unknown[]) => mockOrderBy(...args),
    query: (...args: unknown[]) => mockQuery(...args),
}));

import { getEventById, getEvents, getPages } from '../../services/dal';

describe('dal service', () => {
    beforeEach(() => {
        // Reset all fake calls before each test so tests stay independent.
        mockDoc.mockReset();
        mockGetDoc.mockReset();
        mockCollection.mockReset();
        mockGetDocs.mockReset();
        mockOrderBy.mockReset();
        mockQuery.mockReset();
    });

    it('maps fetched Firestore pages into app page format', async () => {
        // Checks page data from Firestore is converted to the format the app expects.
        mockCollection.mockReturnValueOnce({ path: 'pages' });
        mockGetDocs.mockResolvedValueOnce({
            docs: [
                {
                    id: 'p-1',
                    data: () => ({ name: 'S-Huset', url: 'https://example.com/shuset', active: 1 }),
                },
            ],
        });

        const pages = await getPages();

        expect(pages).toEqual([
            {
                id: 'p-1',
                name: 'S-Huset',
                url: 'https://example.com/shuset',
                active: true,
            },
        ]);
    });

    it('returns an empty page list when Firestore has no pages', async () => {
        // Checks no pages in backend returns an empty list instead of an error.
        mockCollection.mockReturnValueOnce({ path: 'pages' });
        mockGetDocs.mockResolvedValueOnce({ docs: [] });

        const pages = await getPages();

        expect(pages).toEqual([]);
    });

    it('keeps working even if some page fields are missing', async () => {
        // Checks missing page fields do not crash mapping.
        mockCollection.mockReturnValueOnce({ path: 'pages' });
        mockGetDocs.mockResolvedValueOnce({
            docs: [
                {
                    id: 'p-2',
                    data: () => ({}),
                },
            ],
        });

        const pages = await getPages();

        expect(pages).toEqual([
            {
                id: 'p-2',
                name: undefined,
                url: undefined,
                active: false,
            },
        ]);
    });

    it('passes through Firestore errors when loading pages', async () => {
        // Checks page read errors are passed up so UI can show an error state.
        const readError = new Error('pages read failed');
        mockCollection.mockReturnValueOnce({ path: 'pages' });
        mockGetDocs.mockRejectedValueOnce(readError);

        await expect(getPages()).rejects.toBe(readError);
    });

    it('maps fetched Firestore events into app event format', async () => {
        // Checks event data and dates are converted into app-friendly values.
        const eventsCollectionRef = { path: 'events' };
        const orderByRef = { field: 'startTime' };
        mockCollection.mockReturnValueOnce(eventsCollectionRef);
        mockOrderBy.mockReturnValueOnce(orderByRef);
        mockQuery.mockReturnValueOnce({ path: 'events?orderBy=startTime' });
        mockGetDocs.mockResolvedValueOnce({
            docs: [
                {
                    id: 'e-1',
                    data: () => ({
                        pageId: 'p-1',
                        title: 'Friday Bar',
                        description: 'Live music',
                        startTime: { toDate: () => new Date('2026-02-10T17:00:00.000Z') },
                        endTime: { toDate: () => new Date('2026-02-10T22:00:00.000Z') },
                        place: { name: 'DTU' },
                        coverImageUrl: 'https://example.com/cover.jpg',
                        eventURL: 'https://example.com/event/e-1',
                        createdAt: { toDate: () => new Date('2026-01-01T10:00:00.000Z') },
                        updatedAt: { toDate: () => new Date('2026-01-02T10:00:00.000Z') },
                    }),
                },
            ],
        });

        const events = await getEvents();

        expect(events).toEqual([
            {
                id: 'e-1',
                pageId: 'p-1',
                title: 'Friday Bar',
                description: 'Live music',
                startTime: '2026-02-10T17:00:00.000Z',
                endTime: '2026-02-10T22:00:00.000Z',
                place: { name: 'DTU' },
                coverImageUrl: 'https://example.com/cover.jpg',
                eventURL: 'https://example.com/event/e-1',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-02T10:00:00.000Z',
            },
        ]);

        expect(mockCollection).toHaveBeenCalledWith({ name: 'fake-db' }, 'events');
        expect(mockOrderBy).toHaveBeenCalledWith('startTime');
        expect(mockQuery).toHaveBeenCalledWith(eventsCollectionRef, orderByRef);
    });

    it('returns an empty event list when Firestore has no events', async () => {
        // Checks no events in backend returns an empty list.
        mockCollection.mockReturnValueOnce({ path: 'events' });
        mockOrderBy.mockReturnValueOnce({ field: 'startTime' });
        mockQuery.mockReturnValueOnce({ path: 'events?orderBy=startTime' });
        mockGetDocs.mockResolvedValueOnce({ docs: [] });

        const events = await getEvents();

        expect(events).toEqual([]);
    });

    it('keeps working even if some event fields are missing', async () => {
        // Checks missing optional event fields do not break mapping.
        mockCollection.mockReturnValueOnce({ path: 'events' });
        mockOrderBy.mockReturnValueOnce({ field: 'startTime' });
        mockQuery.mockReturnValueOnce({ path: 'events?orderBy=startTime' });
        mockGetDocs.mockResolvedValueOnce({
            docs: [
                {
                    id: 'e-missing',
                    data: () => ({
                        pageId: 'p-1',
                        title: 'Event Without Extras',
                        description: undefined,
                        startTime: { toDate: () => new Date('2026-03-01T12:00:00.000Z') },
                    }),
                },
            ],
        });

        const events = await getEvents();

        expect(events).toEqual([
            {
                id: 'e-missing',
                pageId: 'p-1',
                title: 'Event Without Extras',
                description: undefined,
                startTime: '2026-03-01T12:00:00.000Z',
                endTime: undefined,
                place: undefined,
                coverImageUrl: undefined,
                eventURL: undefined,
                createdAt: undefined,
                updatedAt: undefined,
            },
        ]);
    });

    it('passes through Firestore errors when loading events', async () => {
        // Checks event read errors are passed up for proper handling.
        const readError = new Error('events read failed');
        mockCollection.mockReturnValueOnce({ path: 'events' });
        mockOrderBy.mockReturnValueOnce({ field: 'startTime' });
        mockQuery.mockReturnValueOnce({ path: 'events?orderBy=startTime' });
        mockGetDocs.mockRejectedValueOnce(readError);

        await expect(getEvents()).rejects.toBe(readError);
    });

    it('returns null when event does not exist', async () => {
        // Checks unknown event id returns null instead of crashing.
        mockDoc.mockReturnValueOnce({ path: 'events/missing' });
        mockGetDoc.mockResolvedValueOnce({
            exists: () => false,
        });

        const event = await getEventById('missing');

        expect(event).toBeNull();
    });

    it('passes through Firestore errors when loading one event', async () => {
        // Checks single-event read errors are passed up clearly.
        const readError = new Error('single event read failed');
        mockDoc.mockReturnValueOnce({ path: 'events/fail' });
        mockGetDoc.mockRejectedValueOnce(readError);

        await expect(getEventById('fail')).rejects.toBe(readError);
    });

    it('maps fetched Firestore event to app event format', async () => {
        // Checks one event is mapped correctly, including timestamp conversion.
        mockDoc.mockReturnValueOnce({ path: 'events/evt-1' });
        mockGetDoc.mockResolvedValueOnce({
            id: 'evt-1',
            exists: () => true,
            data: () => ({
                pageId: 'page-1',
                title: 'Sample Event',
                description: 'Desc',
                startTime: { toDate: () => new Date('2026-01-01T12:00:00.000Z') },
                endTime: { toDate: () => new Date('2026-01-01T14:00:00.000Z') },
                place: { name: 'DTU' },
                coverImageUrl: 'https://example.com/image.jpg',
                eventURL: 'https://example.com/event',
                createdAt: { toDate: () => new Date('2025-12-01T10:00:00.000Z') },
                updatedAt: { toDate: () => new Date('2025-12-02T10:00:00.000Z') },
            }),
        });

        const event = await getEventById('evt-1');

        expect(event).toEqual({
            id: 'evt-1',
            pageId: 'page-1',
            title: 'Sample Event',
            description: 'Desc',
            startTime: '2026-01-01T12:00:00.000Z',
            endTime: '2026-01-01T14:00:00.000Z',
            place: { name: 'DTU' },
            coverImageUrl: 'https://example.com/image.jpg',
            eventURL: 'https://example.com/event',
            createdAt: '2025-12-01T10:00:00.000Z',
            updatedAt: '2025-12-02T10:00:00.000Z',
        });
    });
});
