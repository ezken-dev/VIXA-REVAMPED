'use client';

import React, {useMemo, useId} from 'react';

export interface CharVector {
  char: string;
  globalIndex: number;
  offsetX: number;
  offsetY: number;
  rot: number;
  radialX: number;
  radialY: number;
  scrambleSeed: number;
}

const SCRAMBLE_GLYPHS = ['⚡', '*', '#', '{', '}', '0', '1', '/', '+'];

/**
 * Deterministic pseudo-random generator in [0, 1) so useMemo remains 100% pure
 * and scrubbing forward/backward is completely deterministic.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Pre-computes deterministic 2D/3D scatter vectors and scramble seeds for each non-space character.
 */
export function useCharacterVectors(text: string, seedOffset = 1): CharVector[] {
  return useMemo(() => {
    const chars = Array.from(text);
    const total = Math.max(1, chars.length);
    return chars.map((char, idx) => {
      const s1 = seededRandom(idx * 3.17 + seedOffset * 19.3);
      const s2 = seededRandom(idx * 7.41 + seedOffset * 31.7);
      const s3 = seededRandom(idx * 11.13 + seedOffset * 47.9);

      // Normalized position across string (-1 to 1) for radial fan-out
      const normPos = (idx / total - 0.5) * 2;
      const radialX = normPos * 110 + (s1 - 0.5) * 35;
      const radialY = (s2 - 0.5) * 85;

      return {
        char,
        globalIndex: idx,
        offsetX: (s1 - 0.5) * 130, // ±65px
        offsetY: (s2 - 0.5) * 90, // ±45px
        rot: (s3 - 0.5) * 52, // ±26deg
        radialX,
        radialY,
        scrambleSeed: Math.floor(s1 * SCRAMBLE_GLYPHS.length),
      };
    });
  }, [text, seedOffset]);
}

export function getScrambledChar(
  originalChar: string,
  seed: number,
  progress: number
): string {
  if (originalChar === ' ' || progress >= 1 || progress <= 0) {
    return originalChar;
  }
  const step = Math.floor(progress * 6);
  const glyphIdx = (seed + step) % SCRAMBLE_GLYPHS.length;
  return SCRAMBLE_GLYPHS[glyphIdx];
}

interface SplitTextProps {
  text: string;
  charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  startIndex?: number;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  overflowMask?: boolean;
  pinwheelOnFirstI?: boolean;
  pinwheelRef?: React.MutableRefObject<HTMLSpanElement | null>;
}

/**
 * Guardrails 1, 2, & 3 Compliant Text Splitter:
 * - Wraps words in `.word.inline-block.whitespace-nowrap` followed by a standard `" "` space
 *   so words never break mid-letter on mobile screens.
 * - Sets `aria-hidden="true"` on all split spans (parent holds `aria-label`).
 * - Does NOT attach static `will-change-transform`; `willChange` is toggled dynamically in rAF.
 */
export function SplitWords({
  text,
  charRefs,
  startIndex = 0,
  className = '',
  wordClassName = '',
  charClassName = '',
  overflowMask = false,
  pinwheelOnFirstI = false,
  pinwheelRef,
}: SplitTextProps) {
  const words = text.split(' ');
  let runningCharIdx = startIndex;
  let iReplaced = false;

  return (
    <span className={className} aria-hidden="true">
      {words.map((word, wIdx) => {
        const chars = Array.from(word);
        return (
          <React.Fragment key={`${word}-${wIdx}`}>
            <span
              aria-hidden="true"
              className={`word inline-block whitespace-nowrap align-bottom ${
                overflowMask ? 'overflow-hidden pb-[0.08em] -mb-[0.08em]' : ''
              } ${wordClassName}`}
            >
              {chars.map((ch, cIdx) => {
                const currentIdx = runningCharIdx++;
                const isTargetI =
                  pinwheelOnFirstI && !iReplaced && ch.toLowerCase() === 'i';
                if (isTargetI) {
                  iReplaced = true;
                }

                return (
                  <span
                    key={`${cIdx}-${currentIdx}`}
                    ref={(el) => {
                      charRefs.current[currentIdx] = el;
                    }}
                    data-char={ch}
                    aria-hidden="true"
                    className={`char relative inline-block ${charClassName}`}
                  >
                    {isTargetI ? (
                      <span className="relative inline-block">
                        {/* Dotless i stem (ı) with rotating 4-petal PinwheelGlyph as its tittle */}
                        <span>ı</span>
                        <span
                          ref={pinwheelRef}
                          className="absolute -top-[0.18em] left-1/2 -translate-x-1/2 w-[0.42em] h-[0.42em] flex items-center justify-center pointer-events-none"
                        >
                          <PinwheelGlyph className="w-full h-full animate-[spin_7s_linear_infinite]" />
                        </span>
                      </span>
                    ) : (
                      ch
                    )}
                  </span>
                );
              })}
            </span>
            {wIdx < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </span>
  );
}

/**
 * 1. <PinwheelGlyph />: 4-petal geometric flower/star SVG (GSAP showcase coral-amber to violet-cyan gradient)
 */
export function PinwheelGlyph({className = 'w-6 h-6'}: {className?: string}) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`pw-a-${id}`} x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#ff7a59" />
          <stop offset="52%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id={`pw-b-${id}`} x1="48" y1="0" x2="0" y2="48">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* 4 rounded geometric petals */}
      <path
        d="M24 2C29.5 2 33 8.5 30 16L24 24L18 16C15 8.5 18.5 2 24 2Z"
        fill={`url(#pw-b-${id})`}
      />
      <path
        d="M46 24C46 29.5 39.5 33 32 30L24 24L32 18C39.5 15 46 18.5 46 24Z"
        fill={`url(#pw-a-${id})`}
      />
      <path
        d="M24 46C18.5 46 15 39.5 18 32L24 24L30 32C33 39.5 29.5 46 24 46Z"
        fill={`url(#pw-b-${id})`}
      />
      <path
        d="M2 24C2 18.5 8.5 15 16 18L24 24L16 30C8.5 33 2 29.5 2 24Z"
        fill={`url(#pw-a-${id})`}
      />
      <circle cx="24" cy="24" r="3.5" fill="#fffdf9" />
    </svg>
  );
}

/**
 * 2. <AsteriskGlyph />: Bold 8-point coral/amber asterisk SVG that spins with scroll velocity
 */
export const AsteriskGlyph = React.forwardRef<
  SVGSVGElement,
  {className?: string}
>(function AsteriskGlyph({className = 'w-6 h-6'}, ref) {
  const id = useId();
  return (
    <svg
      ref={ref}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`ast-${id}`} x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#ff8a65" />
          <stop offset="100%" stopColor="#ff5252" />
        </linearGradient>
      </defs>
      <g
        stroke={`url(#ast-${id})`}
        strokeWidth="5.2"
        strokeLinecap="round"
      >
        <line x1="20" y1="4" x2="20" y2="36" />
        <line x1="4" y1="20" x2="36" y2="20" />
        <line x1="8.7" y1="8.7" x2="31.3" y2="31.3" />
        <line x1="31.3" y1="8.7" x2="8.7" y2="31.3" />
      </g>
    </svg>
  );
});

/**
 * 3. <LightningGlyph />: Electric neon-green/cyan lightning bolt SVG (matching GSAP "anyth⚡ng")
 */
export const LightningGlyph = React.forwardRef<
  SVGSVGElement,
  {className?: string}
>(function LightningGlyph({className = 'w-7 h-7'}, ref) {
  const id = useId();
  return (
    <svg
      ref={ref}
      viewBox="0 0 36 48"
      fill="none"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`bolt-${id}`} x1="0" y1="0" x2="36" y2="48">
          <stop offset="0%" stopColor="#00f5a0" />
          <stop offset="100%" stopColor="#00d2ff" />
        </linearGradient>
      </defs>
      <path
        d="M22 2L4 27H17L13 46L33 19H19.5L22 2Z"
        fill={`url(#bolt-${id})`}
      />
    </svg>
  );
});

/**
 * 4. <BezierSplineBadge />: Animated S-curve cubic-bezier spline with glowing control handles
 */
export const BezierSplineBadge = React.forwardRef<
  SVGPathElement,
  {className?: string}
>(function BezierSplineBadge({className = 'w-16 h-8'}, pathRef) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl bg-black/45 border border-white/20 px-2 py-1 shadow-inner align-middle ${className}`}
    >
      <svg viewBox="0 0 90 40" fill="none" className="w-full h-full overflow-visible">
        {/* Control Handle Tangents */}
        <line
          x1="10"
          y1="34"
          x2="44"
          y2="34"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <line
          x1="80"
          y1="6"
          x2="46"
          y2="6"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        {/* Animated S-Curve Spline */}
        <path
          ref={pathRef}
          d="M 10 34 C 45 34, 45 6, 80 6"
          stroke="#e2f1ff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray="96"
          strokeDashoffset="0"
        />
        {/* Anchor & Control Points (Glowing Neon Green like GSAP video) */}
        <circle cx="44" cy="34" r="3" fill="#a855f7" />
        <circle cx="46" cy="6" r="3" fill="#38bdf8" />
        <circle
          cx="10"
          cy="34"
          r="4.2"
          fill="#00f5a0"
          stroke="#061018"
          strokeWidth="1.5"
        />
        <circle
          cx="80"
          cy="6"
          r="4.2"
          fill="#00f5a0"
          stroke="#061018"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
});

/**
 * 5. <SpringCoilGlyph />: 3D-shaded violet/indigo spiral coil ornament (matching GSAP video)
 */
export const SpringCoilGlyph = React.forwardRef<
  SVGSVGElement,
  {className?: string}
>(function SpringCoilGlyph({className = 'w-6 h-8'}, ref) {
  const id = useId();
  return (
    <svg
      ref={ref}
      viewBox="0 0 36 48"
      fill="none"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`coil-${id}`} x1="0" y1="0" x2="36" y2="48">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d="M8 10C8 5.5 28 5.5 28 11.5C28 17.5 8 17.5 8 23.5C8 29.5 28 29.5 28 35.5C28 41.5 11 42 14 44"
        stroke={`url(#coil-${id})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
