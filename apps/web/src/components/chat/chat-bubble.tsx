import { ChatCircleDotsIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';

const SIZE = 60;
const MARGIN = 12;
const STORAGE_KEY = 'qd-chat-bubble';

type Point = { x: number; y: number };

const clamp = ({ x, y }: Point): Point => ({
  x: Math.min(Math.max(MARGIN, x), window.innerWidth - SIZE - MARGIN),
  y: Math.min(Math.max(MARGIN + 64, y), window.innerHeight - SIZE - MARGIN),
});

/** Bottom-left by default, away from the right-hand action buttons. */
const defaultPosition = (): Point =>
  clamp({ x: MARGIN, y: window.innerHeight - SIZE - Math.max(16, MARGIN) });

function savedPosition(): Point {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Point | null;
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return clamp(saved);
  } catch {
    // Storage blocked or bad data: use the default.
  }
  return defaultPosition();
}

/**
 * Floating chat assistant bubble that can be dragged anywhere on screen (mouse, touch or
 * arrow keys when focused). A tap opens the assistant; a drag never does. The position
 * is remembered per browser and kept inside the viewport on resize.
 */
export function ChatBubble() {
  const show = useQuickActions((s) => s.show);
  const [position, setPosition] = useState<Point>(savedPosition);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ start: Point; origin: Point; moved: boolean } | null>(null);

  useEffect(() => {
    const onResize = () => setPosition((current) => clamp(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const remember = (point: Point) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(point));
    } catch {
      // Not critical: the bubble just starts at its default spot next time.
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      start: { x: event.clientX, y: event.clientY },
      origin: position,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.start.x;
    const dy = event.clientY - state.start.y;
    if (!state.moved && Math.hypot(dx, dy) < 6) return;
    if (!state.moved) {
      state.moved = true;
      setDragging(true);
    }
    setPosition(clamp({ x: state.origin.x + dx, y: state.origin.y + dy }));
  };

  const onPointerUp = () => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    if (state.moved) {
      setDragging(false);
      setPosition((current) => {
        const settled = clamp(current);
        remember(settled);
        return settled;
      });
    } else {
      show('chat');
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 64 : 24;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setPosition((current) => {
      const next = clamp({ x: current.x + move.x, y: current.y + move.y });
      remember(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      aria-label="Chat assistant (drag or use arrow keys to move)"
      title="Chat assistant"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      // Named so page transitions leave the bubble where it is.
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        viewTransitionName: 'chat-bubble',
      }}
      className={cx(
        'group fixed top-0 left-0 z-30 grid size-15 touch-none place-items-center rounded-full bg-linear-to-br from-brand to-brand-strong text-on-brand shadow-xl shadow-elevation/30 select-none',
        dragging
          ? 'scale-110 cursor-grabbing shadow-2xl'
          : 'cursor-grab transition-[transform,scale,box-shadow] duration-300 ease-out hover:scale-105',
      )}
    >
      {/* Gentle attention ring, a few times after load. */}
      <span
        aria-hidden
        className="absolute inset-0 animate-[chat-ping_2.4s_var(--ease-out)_3] rounded-full border-2 border-brand motion-reduce:hidden"
      />
      <ChatCircleDotsIcon size={28} weight="fill" aria-hidden />
      <span
        aria-hidden
        className="absolute -top-0.5 -right-0.5 size-4 rounded-full border-2 border-surface bg-highlight"
      />
    </button>
  );
}
