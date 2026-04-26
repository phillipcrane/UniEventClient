import { useEffect, useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { EventList } from '../components/EventList';
import { CalendarView } from '../components/Calendar';
import { Footer } from '../components/Footer';
import { HeaderLogoLink } from '../components/HeaderLogoLink';
import { UserMenu } from '../components/UserMenu';
import { getEvents, getPages } from '../services/dal';
import { mapAuthError, signOutCurrentUser } from '../services/auth';
import { useFilterBar } from '../hooks/useFilterBar';
import type { Event as EventType, Page } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, LayoutList } from 'lucide-react';

export function MainPage() {
  const { currentUser } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const {
    pageIds, setPageIds,
    query, setQuery,
    fromDate, setFromDate,
    toDate, setToDate,
    sortMode, setSortMode,
    list, count, invalidRange,
  } = useFilterBar(events);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [page, event] = await Promise.all([getPages(), getEvents()]);
        if (cancelled) return;

        setPages(page);
        setEvents(event);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error && err.message ? err.message : 'Failed to load data';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setError('');
      await signOutCurrentUser();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsSigningOut(false);
    }
  }

  const userLabel = currentUser?.username || currentUser?.email || 'My Profile';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="page-header mx-6 md:mx-8 mt-4 md:mt-6 mb-6">
        <div className="header-content">
          <HeaderLogoLink />
          <div className="header-text">
            <h1 className="header-title main-header-title">DTU Events</h1>
            <p className="header-subtitle main-header-subtitle">Discover Technical University of Denmark Events</p>
          </div>
        </div>

        <div className="header-toggle relative flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 py-1.5 shadow-sm">
          <ThemeToggle />

          {currentUser ? (
            <UserMenu
              userLabel={userLabel}
              onSignOut={handleSignOut}
              isSigningOut={isSigningOut}
            />
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--button-hover)] sm:px-4 sm:text-sm"
              aria-label="Log in or sign up"
            >
              Log In / Sign Up
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 px-6 md:px-8 pb-8 max-w-6xl mx-auto w-full">
        <div className="space-y-8">
          <FilterBar
            pages={pages}
            pageIds={pageIds}
            setPageIds={setPageIds}
            query={query}
            setQuery={setQuery}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            count={count}
            sortMode={sortMode}
            setSortMode={setSortMode}
          />

          {loading && (
            <p className="text-sm text-[var(--text-subtle)] mb-2 animate-pulse">Loading…</p>
          )}

          {error && (
            <p className="text-sm text-[var(--dtu-accent)] mb-2 font-semibold">{error}</p>
          )}

          {invalidRange && (
            <p className="text-xs text-[var(--dtu-accent)] mb-2 font-semibold">
              End date is before start date. Showing results up to any end date.
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 gap-3">
            <div className="text-sm font-medium text-[var(--text-subtle)]" aria-live="polite">
              {count} event{count === 1 ? '' : 's'} found
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--input-bg)] p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${viewMode === 'list'
                  ? 'bg-[var(--link-primary)] text-white border-transparent'
                  : 'bg-[var(--panel-bg)] text-[var(--text-primary)] border-[var(--panel-border)] hover:bg-[var(--input-bg)]'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutList size={16} />
                  List
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                aria-pressed={viewMode === 'calendar'}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${viewMode === 'calendar'
                  ? 'bg-[var(--link-primary)] text-white border-transparent'
                  : 'bg-[var(--panel-bg)] text-[var(--text-primary)] border-[var(--panel-border)] hover:bg-[var(--input-bg)]'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} />
                  Calendar
                </span>
              </button>
            </div>
          </div>

          {viewMode === 'list' ? <EventList list={list} /> : <CalendarView events={list} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
