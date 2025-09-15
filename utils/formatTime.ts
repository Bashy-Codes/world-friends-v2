import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time strings for better UX
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s: 'now',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  }
});

/**
 * Format a timestamp to a user-friendly relative time string
 * @param timestamp - The timestamp in milliseconds (Convex _creationTime)
 * @returns A formatted string like "2m ago", "1h ago", "3d ago", etc.
 */
export function formatTimeAgo(timestamp: number): string {
  const now = dayjs();
  const time = dayjs(timestamp);
  
  // If it's less than a minute ago, show "now"
  if (now.diff(time, 'second') < 60) {
    return 'now';
  }
  
  // Use dayjs relative time for everything else
  return time.fromNow();
}

/**
 * Format a timestamp to a full date string
 * @param timestamp - The timestamp in milliseconds (Convex _creationTime)
 * @returns A formatted string like "Jan 15, 2024 at 2:30 PM"
 */
export function formatFullDate(timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY [at] h:mm A');
}

/**
 * Format a timestamp to a short date string
 * @param timestamp - The timestamp in milliseconds (Convex _creationTime)
 * @returns A formatted string like "Jan 15, 2024"
 */
export function formatShortDate(timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY');
}

/**
 * Check if a timestamp is today
 * @param timestamp - The timestamp in milliseconds (Convex _creationTime)
 * @returns True if the timestamp is from today
 */
export function isToday(timestamp: number): boolean {
  return dayjs(timestamp).isSame(dayjs(), 'day');
}

/**
 * Check if a timestamp is from this week
 * @param timestamp - The timestamp in milliseconds (Convex _creationTime)
 * @returns True if the timestamp is from this week
 */
export function isThisWeek(timestamp: number): boolean {
  return dayjs(timestamp).isSame(dayjs(), 'week');
}
