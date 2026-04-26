import { useEffect, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../constants';
import { parseDateOnly, startOfDayMs, endOfDayMs } from '../utils/dateUtils';
import type { Event as EventType } from '../types';
import type { SortMode } from '../components/FilterBar';

export function useFilterBar(events: EventType[]) {
  const [pageIds, setPageIds] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const filteredByPage = pageIds.length > 0 ? events.filter(e => pageIds.includes(e.pageId)) : events;

  const textFiltered = debouncedQuery
    ? filteredByPage.filter(event => {
      const haystack = (
        (event.title || '') + ' ' +
        (event.description || '') + ' ' +
        (event.place?.name || '')
      ).toLowerCase();
      return haystack.includes(debouncedQuery);
    })
    : filteredByPage;

  const fromObj = parseDateOnly(fromDate);
  const toObj = parseDateOnly(toDate);
  const invalidRange = !!(fromObj && toObj && toObj < fromObj);
  const effectiveToObj = invalidRange ? undefined : toObj;

  const dateFiltered = textFiltered.filter(event => {
    const eventMs = new Date(event.startTime).getTime();
    if (fromObj && eventMs < startOfDayMs(fromObj)) return false;
    if (effectiveToObj && eventMs > endOfDayMs(effectiveToObj)) return false;
    return true;
  });

  const [sortMode, setSortMode] = useState<SortMode>('upcoming');

  const getCreatedMs = (e: EventType) => {
    type LegacyEvent = EventType & { createdTime?: string; postedTime?: string; insertedAt?: string; addedAt?: string };
    const le = e as LegacyEvent;
    const maybe = le.createdTime ?? le.createdAt ?? le.postedTime ?? le.insertedAt ?? le.addedAt ?? le.startTime;
    const ms = Date.parse(maybe);
    return isNaN(ms) ? new Date(e.startTime).getTime() : ms;
  };

  let list = [...dateFiltered];

  if (sortMode !== 'all') {
    const now = new Date().getTime();
    list = list.filter(event => new Date(event.startTime).getTime() >= now);
  }

  if (sortMode === 'newest') {
    list = list.sort((a, b) => getCreatedMs(b) - getCreatedMs(a));
  }

  return {
    pageIds,
    setPageIds,
    query,
    setQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sortMode,
    setSortMode,
    list,
    count: list.length,
    invalidRange,
  };
}
