import { useEffect } from 'react';

/** Labels the tab and keeps staff pages out of search engines (noindex, nofollow). */
export function useStaffDocument(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Quantum staff`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    const before = robots.content;
    robots.content = 'noindex, nofollow';
    return () => {
      document.title = previous;
      if (created) robots?.remove();
      else if (robots) robots.content = before;
    };
  }, [title]);
}

/** Same rule as the auth server: 10+ characters with upper, lower, digit and symbol. */
export function passwordProblem(value: string) {
  if (value.length < 10) return 'Use at least 10 characters.';
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return 'Use upper and lower case letters.';
  if (!/\d/.test(value)) return 'Add a number.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Add a symbol, e.g. ! or %.';
  return '';
}
