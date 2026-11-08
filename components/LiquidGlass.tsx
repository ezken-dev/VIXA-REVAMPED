'use client';

import React, {useEffect, useState, useRef} from 'react';

/**
 * Synchronous, SSR-ready SVG optical lens map (zero runtime canvas delay, zero 0.5s pop).
 * Center is neutral rgb(128,128,128) so there is no sudden zoom jump;
 * curved edges smoothly refract light in one consistent direction.
 */
const CRYSTAL_LENS_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='100' viewBox='0 0 400 100'><defs><radialGradient id='lens' cx='50%25' cy='50%25' r='50%25'><stop offset='0%25' stop-color='rgb(128,128,128)'/><stop offset='72%25' stop-color='rgb(128,128,128)'/><stop offset='90%25' stop-color='rgb(112,114,128)'/><stop offset='100%25' stop-color='rgb(88,92,128)'/></radialGradient></defs><rect width='400' height='100' fill='url(%23lens)'/></svg>";

export function LiquidGlassFilters() {
  return (
    <svg
      aria-hidden="true"
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none opacity-0"
    >
      <defs>
        {/* Crystal-Clear Optical Filter for Floating Pill Navbar (Minimal blur, edge-only refraction) */}
        <filter
          id="lg-refract-nav"
          x="-4%"
          y="-10%"
          width="108%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.45"
            result="crystalSource"
          />
          <feImage
            href={CRYSTAL_LENS_URI}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="lensMap"
          />
          <feDisplacementMap
            in="crystalSource"
            in2="lensMap"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feColorMatrix
            in="refracted"
            type="saturate"
            values="1.15"
            result="saturated"
          />
        </filter>

        {/* Crystal-Clear Optical Filter for Pill Buttons */}
        <filter
          id="lg-refract-btn"
          x="-6%"
          y="-12%"
          width="112%"
          height="124%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.4"
            result="crystalBtn"
          />
          <feImage
            href={CRYSTAL_LENS_URI}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="btnLens"
          />
          <feDisplacementMap
            in="crystalBtn"
            in2="btnLens"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refractedBtn"
          />
          <feColorMatrix
            in="refractedBtn"
            type="saturate"
            values="1.15"
            result="saturatedBtn"
          />
        </filter>

        {/* Crystal-Clear Optical Filter for Popover/Modal Cards (Clear crystal glass, not frosted) */}
        <filter
          id="lg-refract-card"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.85"
            result="crystalCard"
          />
          <feImage
            href={CRYSTAL_LENS_URI}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="cardLens"
          />
          <feDisplacementMap
            in="crystalCard"
            in2="cardLens"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refractedCard"
          />
          <feColorMatrix
            in="refractedCard"
            type="saturate"
            values="1.18"
            result="saturatedCard"
          />
        </filter>
      </defs>
    </svg>
  );
}

interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  variant?: 'nav' | 'pill' | 'card';
  className?: string;
  roundedClass?: string;
  as?: 'div' | 'button';
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  tint?: 'sky-pill' | 'meadow-pill' | 'card-glass';
}

export function LiquidGlassSurface({
  children,
  variant = 'pill',
  className = '',
  roundedClass = 'rounded-full',
  as = 'div',
  onClick,
  type = 'button',
  ariaLabel,
  tint = 'sky-pill',
}: LiquidGlassSurfaceProps) {
  const ref = useRef<HTMLElement | null>(null);
  const targetRef = useRef({x: 35, y: 20, intensity: 0.75});
  const currentRef = useRef({x: 35, y: 20, intensity: 0.75});
  const [glint, setGlint] = useState({
    x: 35,
    y: 20,
    intensity: 0.75,
  });

  useEffect(() => {
    let rafId: number;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      const relX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const relY = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      const clampedX = Math.max(0, Math.min(100, relX));
      const clampedY = Math.max(0, Math.min(100, relY));

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const intensity = Math.max(0.4, Math.min(1, 1 - dist / 950));

      targetRef.current = {x: clampedX, y: clampedY, intensity};
    };

    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      const dx = tgt.x - cur.x;
      const dy = tgt.y - cur.y;
      const di = tgt.intensity - cur.intensity;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 || Math.abs(di) > 0.005) {
        cur.x += dx * 0.14;
        cur.y += dy * 0.14;
        cur.intensity += di * 0.14;
        setGlint({
          x: cur.x,
          y: cur.y,
          intensity: cur.intensity,
        });
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, {passive: true});
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const filterId =
    variant === 'nav'
      ? 'url(#lg-refract-nav)'
      : variant === 'card'
      ? 'url(#lg-refract-card)'
      : 'url(#lg-refract-btn)';

  // Pure Crystal-Clear Transparency (no dark or milky frosted tint)
  const baseBg =
    tint === 'sky-pill'
      ? 'rgba(255, 255, 255, 0.06)'
      : tint === 'meadow-pill'
      ? 'rgba(255, 255, 255, 0.07)'
      : 'rgba(255, 255, 255, 0.09)';

  // Crisp crystal edge meniscus without dark shadows
  const meniscusShadow =
    tint === 'sky-pill'
      ? 'inset 0 1px 1.5px rgba(255, 253, 245, 0.78), inset 0 -1px 2px rgba(205, 236, 255, 0.35), 0 6px 20px -6px rgba(14, 34, 48, 0.08)'
      : tint === 'meadow-pill'
      ? 'inset 0 1px 1.5px rgba(255, 253, 245, 0.8), inset 0 -1px 2px rgba(220, 242, 215, 0.35), 0 6px 20px -6px rgba(10, 24, 14, 0.12)'
      : 'inset 0 1.5px 2px rgba(255, 253, 245, 0.82), inset 0 -1.5px 2.5px rgba(215, 240, 220, 0.35), 0 12px 32px -8px rgba(8, 20, 12, 0.16)';

  const sharedStyle: React.CSSProperties = {
    backdropFilter: filterId,
    WebkitBackdropFilter: filterId,
    backgroundColor: baseBg,
    boxShadow: meniscusShadow,
  };

  const innerMarkup = (
    <>
      {/* 1. Smooth One-Way Diagonal Sunlight Sheen (Fixed 115deg sun angle, lerped 60fps cursor tracking) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${roundedClass}`}
        style={{
          background: `linear-gradient(115deg, transparent ${Math.max(
            0,
            glint.x - 26
          )}%, rgba(255, 253, 242, ${(0.18 * glint.intensity).toFixed(
            2
          )}) ${glint.x}%, rgba(215, 240, 255, ${(
            0.1 * glint.intensity
          ).toFixed(2)}) ${Math.min(100, glint.x + 12)}%, transparent ${Math.min(
            100,
            glint.x + 30
          )}%)`,
        }}
      />

      {/* 2. Thin 1px Crystal Rim Along the Edge */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${roundedClass}`}
        style={{
          padding: '1px',
          background: `radial-gradient(240px circle at ${glint.x}% ${glint.y}%, rgba(255, 254, 248, 0.95) 0%, rgba(230, 245, 255, 0.62) 48%, rgba(225, 242, 228, 0.32) 100%)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* 3. Content Layer */}
      <span className="relative z-10 flex items-center justify-between w-full">
        {children}
      </span>
    </>
  );

  if (as === 'button') {
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        style={sharedStyle}
        className={`relative overflow-hidden ${roundedClass} transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985] cursor-pointer ${className}`}
      >
        {innerMarkup}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onClick={onClick}
      style={sharedStyle}
      className={`relative overflow-hidden ${roundedClass} ${className}`}
    >
      {innerMarkup}
    </div>
  );
}
