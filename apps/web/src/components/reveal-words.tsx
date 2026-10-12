import { Fragment, type CSSProperties } from 'react';

/**
 * Splits a heading into words so they can rise in one after another. Inside a
 * `.heading-3d` heading the words follow the scroll (each word's own view timeline);
 * inside `.hero-words` they play once as the page opens. Both are pure CSS
 * (styles.css), and the text stays plain words for screen readers and search engines.
 */
export function RevealWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="word" style={{ '--i': Math.min(index, 10) } as CSSProperties}>
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
