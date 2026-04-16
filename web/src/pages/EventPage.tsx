import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { Event } from '../types';
import { getEventById } from '../services/dal';
import { formatEventStart } from '../utils/eventUtils';
import { downloadIcs, buildGoogleCalendarUrl } from '../utils/calendarUtils';
import { FacebookLinkButton } from '../components/FacebookLinkButton';
import { LikeButton } from '../components/LikeButton';
import { HeaderLogoLink } from '../components/HeaderLogoLink';
import { ThemeToggle } from '../components/ThemeToggle';

export function EventPage() {
  const { id } = useParams<{ id: string }>(); // id for /events/:id
  const navigate = useNavigate(); // surprise tool that will help us later
  const [event, setEvent] = useState<Event | null>(null); // make events stateful
  const [isLoading, setIsLoading] = useState(true);

  // () => means "when this happens, do this". Lambda function / arrow function syntax.
  useEffect(() => {
    if (!id) return;

    // fetch event by id from dal.ts
    const getEventFromDal = async () => {
      const fetchedEvent = await getEventById(id);
      setEvent(fetchedEvent);
      setIsLoading(false);
    };
    getEventFromDal(); // async
  }, [id]);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);

  // close the menu when clicking outside
  useEffect(() => {
    if (!showAddMenu) return;

    const onClick = (e: MouseEvent) => {
      if (!addMenuRef.current?.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showAddMenu]);

  const handleBack = () => { // when back button clicked...
    navigate('/'); // ...go back to main events list
  };

  // Main Rendering of EventPage
  return (
    <div className="page flex flex-col">

      <header className="page-header mx-6 md:mx-8 mt-4 md:mt-6 mb-6 sticky top-4 z-20">
        <div className="header-content">
          <HeaderLogoLink />
          <div className="header-text">
            <h1 className="header-title">{event?.title || 'Event details'}</h1>
            <p className="header-subtitle">
              {event ? 'View the event, add it to your calendar, or save it.' : 'Loading event details...'}
            </p>
          </div>
        </div>

        <div className="header-toggle relative flex items-center gap-2">
          <button
            onClick={() => handleBack()}
            aria-label="Back to events"
            className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--button-hover)] sm:px-4 sm:text-sm"
          >
            Back
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto pb-16 px-4">
          {isLoading && (
            <div className="bubble p-6 mb-6">
              <p className="text-sm text-[var(--text-subtle)] animate-pulse">Loading event…</p>
            </div>
          )}

          {!isLoading && !event && (
            <div className="bubble p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Event not found</h2>
              <p className="text-subtle">The event may have been removed or the link is invalid.</p>
            </div>
          )}

          {event && (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenu(v => !v)}
                    className="bg-[var(--link-primary)] hover:bg-[var(--link-primary-hover)] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    Add to calendar
                  </button>

                  {showAddMenu && (
                    <div
                      ref={addMenuRef}
                      className="absolute left-0 mt-2 w-44 bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-lg shadow-xl z-50"
                    >
                      <button
                        onClick={() => {
                          window.open(buildGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
                          setShowAddMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[var(--input-bg)] transition"
                      >
                        Google Calendar
                      </button>
                      <button
                        onClick={() => {
                          downloadIcs(event);
                          setShowAddMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[var(--input-bg)] transition"
                      >
                        Apple / .ics
                      </button>
                    </div>
                  )}
                </div>

                <LikeButton event={event} />
                <FacebookLinkButton event={event} />
              </div>
          
              {/* Hero / Cover Image */}
              <div className="w-full h-[45vh] min-h-[260px] relative rounded-b-lg overflow-hidden mb-6">
                <img
                  src={event.coverImageUrl ?? ''}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Event Header */}
              <section className="-mt-12 relative">
                <div className="bubble p-6 shadow-xl">
                  <h1 className="text-3xl font-bold text-primary mb-2">
                    {event.title}
                  </h1>

                  {/* Location */}
                  {event.place && (
                    <div className="text-subtle text-sm leading-relaxed">
                      <div className="font-semibold text-primary text-base">
                        {event.place.name}
                      </div>

                      {event.place.location && (
                        <div className="mt-1">
                          {event.place.location.street && (
                            <div>{event.place.location.street}</div>
                          )}
                          {(event.place.location.zip || event.place.location.city) && (
                            <div>
                              {event.place.location.zip} {event.place.location.city}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-sm mt-4 text-subtle">
                    {formatEventStart(event.startTime)}
                  </div>
                </div>
              </section>

              {/* Description */}
              <section className="mt-6">
                <div className="bubble p-6">
                  {event.description ? (
                    <div className="prose prose-sm max-w-none text-primary whitespace-pre-wrap break-words overflow-hidden">
                      {event.description}
                    </div>
                  ) : (
                    <p className="text-subtle italic">No description available</p>
                  )}
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
