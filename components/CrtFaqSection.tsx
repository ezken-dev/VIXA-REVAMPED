'use client';

import React, {useState, useEffect, useRef, useMemo} from 'react';
import {Search, ChevronDown} from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const VIXA_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Is the price fixed?',
    answer: 'Yes, with no SST added',
  },
  {
    id: 'faq-2',
    question: 'How many pages do I get?',
    answer: '1, up to 6, or up to 10 plus a shop',
  },
  {
    id: 'faq-3',
    question: 'How many rounds of changes?',
    answer: '1 to 3, by package',
  },
  {
    id: 'faq-4',
    question: 'When does it go live?',
    answer: '7 to 45 days, by package',
  },
  {
    id: 'faq-5',
    question: 'Who owns the website?',
    answer: 'You do',
  },
  {
    id: 'faq-6',
    question: 'What do changes after launch cost?',
    answer: 'Edit hours are included',
  },
  {
    id: 'faq-7',
    question: 'Will anyone find it?',
    answer: 'Google setup included, SEO plans to rank',
  },
];

const LEFT_BAR_HEIGHTS = [430, 360, 288, 216, 156];
const RIGHT_BAR_HEIGHTS = [156, 216, 288, 360, 430];

interface CrtFaqSectionProps {
  /** Stage 6 normalized scroll progress (0.00 -> 1.00) */
  stage6ProgressRef: React.MutableRefObject<number>;
}

/**
 * Generates an inline data URI for an SVG radial barrel displacement map
 * so `<feDisplacementMap>` warps the CRT screen with authentic curved-tube optics.
 */
function buildBarrelDisplacementUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="xGrad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="rgb(0,128,128)" />
        <stop offset="50%" stop-color="rgb(128,128,128)" />
        <stop offset="100%" stop-color="rgb(255,128,128)" />
      </linearGradient>
      <linearGradient id="yGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="rgb(128,0,128)" />
        <stop offset="50%" stop-color="rgb(128,128,128)" />
        <stop offset="100%" stop-color="rgb(128,255,128)" />
      </linearGradient>
      <radialGradient id="edgeMask" cx="50%" cy="50%" r="52%">
        <stop offset="0%" stop-color="rgb(128,128,128)" stop-opacity="1" />
        <stop offset="72%" stop-color="rgb(128,128,128)" stop-opacity="0.82" />
        <stop offset="100%" stop-color="rgb(128,128,128)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="256" height="256" fill="url(#xGrad)" />
    <rect width="256" height="256" fill="url(#yGrad)" style="mix-blend-mode:screen" />
    <rect width="256" height="256" fill="url(#edgeMask)" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const BARREL_MAP_URI = buildBarrelDisplacementUri();

export default function CrtFaqSection({stage6ProgressRef}: CrtFaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [uVal, setUVal] = useState<string>(
    'calc(min(100vw, 2200px) / 1778)'
  );
  const [isPhone, setIsPhone] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const staticFlashRef = useRef<HTMLDivElement | null>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rollBarRef = useRef<HTMLDivElement | null>(null);
  const lightBarsWrapRef = useRef<HTMLDivElement | null>(null);
  const radialGlowRef = useRef<HTMLDivElement | null>(null);
  const pillTagRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasPlayedEntranceRef = useRef<boolean>(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return VIXA_FAQ_ITEMS;
    return VIXA_FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Responsive reference unit `--u` calculation
  useEffect(() => {
    const updateUnit = () => {
      const vw = window.innerWidth;
      if (vw >= 1200) {
        setUVal('calc(min(100vw, 2200px) / 1778)');
        setIsPhone(false);
      } else if (vw >= 768) {
        setUVal('0.82px');
        setIsPhone(false);
      } else {
        setUVal('0.8px');
        setIsPhone(true);
      }
    };
    updateUnit();
    window.addEventListener('resize', updateUnit, {passive: true});
    return () => window.removeEventListener('resize', updateUnit);
  }, []);

  // Choreographed 1.9s Web Animations API Entrance Sequence
  const triggerEntranceSequence = () => {
    if (hasPlayedEntranceRef.current) return;
    hasPlayedEntranceRef.current = true;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';

    // 1. 0ms - 450ms: Stepped cyan light bars & radial CRT glow power on
    if (lightBarsWrapRef.current) {
      lightBarsWrapRef.current.animate(
        [
          {opacity: 0, transform: 'scaleY(0.6)'},
          {opacity: 1, transform: 'scaleY(1)'},
        ],
        {duration: 450, easing: easeOut, fill: 'both'}
      );
    }
    if (radialGlowRef.current) {
      radialGlowRef.current.animate(
        [
          {opacity: 0, transform: 'scale(0.75)'},
          {opacity: 1, transform: 'scale(1)'},
        ],
        {duration: 450, easing: easeOut, fill: 'both'}
      );
    }

    // 2. 250ms - 750ms: FAQ glass pill tag + headline rising with optical de-blur
    if (pillTagRef.current) {
      pillTagRef.current.animate(
        [
          {opacity: 0, transform: 'translateY(14px) scale(0.9)'},
          {opacity: 1, transform: 'translateY(0px) scale(1)'},
        ],
        {duration: 500, delay: 250, easing: easeOut, fill: 'both'}
      );
    }
    if (headlineRef.current) {
      headlineRef.current.animate(
        [
          {
            opacity: 0,
            transform: 'translateY(18px)',
            filter: 'blur(8px)',
          },
          {
            opacity: 1,
            transform: 'translateY(0px)',
            filter: 'blur(0px)',
          },
        ],
        {duration: 500, delay: 310, easing: easeOut, fill: 'both'}
      );
    }

    // 3. 550ms - 950ms: Refractive glass search bar rises
    if (searchWrapRef.current) {
      searchWrapRef.current.animate(
        [
          {opacity: 0, transform: 'translateY(20px)'},
          {opacity: 1, transform: 'translateY(0px)'},
        ],
        {duration: 400, delay: 550, easing: easeOut, fill: 'both'}
      );
    }

    // 4. 750ms - 1600ms: 7 accordion rows resolve in reading order, staggered 75ms apart
    for (let i = 0; i < rowRefs.current.length; i++) {
      const rowEl = rowRefs.current[i];
      if (!rowEl) continue;
      rowEl.animate(
        [
          {opacity: 0, transform: 'translateY(18px)'},
          {opacity: 1, transform: 'translateY(0px)'},
        ],
        {
          duration: 420,
          delay: 750 + i * 75,
          easing: easeOut,
          fill: 'both',
        }
      );
    }
  };

  // 60fps CRT Static Grain + Phase C Screen Lock & Entrance Trigger
  useEffect(() => {
    let rafId = 0;
    const canvas = grainCanvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas) {
      canvas.width = 160;
      canvas.height = 160;
    }

    const imgData = ctx ? ctx.createImageData(160, 160) : null;
    const buf32 = imgData ? new Uint32Array(imgData.data.buffer) : null;

    const loop = () => {
      const p6 = stage6ProgressRef.current;

      // Phase C: Analog Static Flash (0.42 -> 0.50) & Screen Lock (0.45 -> 1.00)
      if (containerRef.current) {
        if (p6 < 0.41) {
          containerRef.current.style.opacity = '0';
          containerRef.current.style.visibility = 'hidden';
          containerRef.current.style.pointerEvents = 'none';
          if (p6 < 0.15) {
            hasPlayedEntranceRef.current = false;
          }
        } else {
          containerRef.current.style.visibility = 'visible';
          const screenAlpha = Math.max(
            0,
            Math.min(1, (p6 - 0.43) / 0.06)
          );
          containerRef.current.style.opacity = screenAlpha.toFixed(3);
          containerRef.current.style.pointerEvents =
            p6 >= 0.48 ? 'auto' : 'none';
        }
      }

      // Trigger one-time 1.9s Web Animations API entrance when stage6Progress >= 0.48
      if (p6 >= 0.48 && !hasPlayedEntranceRef.current) {
        triggerEntranceSequence();
      }

      // Analog static burst intensity during camera glass entry (0.42 -> 0.50)
      const isInStaticWindow = p6 >= 0.41 && p6 <= 0.51;
      const staticSpike = isInStaticWindow
        ? Math.sin(((p6 - 0.41) / 0.1) * Math.PI)
        : 0;

      if (staticFlashRef.current) {
        const flashOp = Math.max(0, staticSpike * 0.65);
        staticFlashRef.current.style.opacity = flashOp.toFixed(3);
      }

      if (canvas) {
        const grainOp = 0.035 + Math.max(0, staticSpike) * 0.185; // 0.035 resting, spikes to 0.22
        canvas.style.opacity = grainOp.toFixed(3);
      }

      // Render live 60fps CRT static snow & 6s vertical phosphor refresh roll bar when visible
      if (p6 >= 0.4) {
        if (rollBarRef.current) {
          const cycle = ((performance.now() % 6000) / 6000) * 120 - 15;
          rollBarRef.current.style.top = `${cycle.toFixed(2)}%`;
        }
        if (ctx && imgData && buf32) {
          for (let i = 0; i < buf32.length; i++) {
            const v = (Math.random() * 255) | 0;
            // Slight cyan phosphor tint in static snow
            const r = (v * 0.78) | 0;
            const g = (v * 0.96) | 0;
            const b = v;
            buf32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [stage6ProgressRef]);

  const handleToggleRow = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      ref={containerRef}
      style={
        {
          '--u': uVal,
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          perspective: '1100px',
        } as React.CSSProperties
      }
      className="z-30 absolute inset-0 bg-[#04060a] flex items-center justify-center select-none"
    >
      {/* Inline SVG Barrel / Fisheye Displacement Filter */}
      <svg
        aria-hidden="true"
        className="sr-only pointer-events-none w-0 h-0 absolute"
      >
        <defs>
          <filter
            id="crt-fisheye-filter"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={BARREL_MAP_URI}
              result="barrelMap"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="barrelMap"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Curved CRT Monitor Bezel Frame */}
      <div
        style={{
          boxShadow:
            'inset 0 0 90px rgba(0,0,0,0.95), inset 0 0 25px rgba(0,210,255,0.18), 0 0 0 12px #05070c',
        }}
        className="relative w-[calc(100%-16px)] h-[calc(100%-16px)] md:w-[calc(100%-32px)] md:h-[calc(100%-32px)] m-2 md:m-4 rounded-[36px] md:rounded-[48px] overflow-hidden border border-white/10 bg-[#06080d]"
      >
        {/* Top Electric Cyan Phosphor Spill */}
        <div
          aria-hidden="true"
          style={{
            height: 'calc(180 * var(--u))',
            background:
              'radial-gradient(ellipse 68% 100% at 50% 0%, rgba(0, 210, 255, 0.18) 0%, transparent 100%)',
          }}
          className="absolute inset-x-0 top-0 pointer-events-none z-[1]"
        />

        {/* Central Radial Glow: 740u x 950u, centered 92u from top */}
        <div
          ref={radialGlowRef}
          aria-hidden="true"
          style={{
            width: 'calc(740 * var(--u))',
            height: 'calc(950 * var(--u))',
            top: 'calc(92 * var(--u))',
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, #0c2636 0%, #06080d 100%)',
          }}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[1] rounded-full blur-2xl"
        />

        {/* Stepped Vertical Light Bars: 655u-tall top layer, 5 left & 5 right, each 88u wide */}
        <div
          ref={lightBarsWrapRef}
          aria-hidden="true"
          style={{
            height: 'calc(655 * var(--u))',
          }}
          className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between pointer-events-none origin-top overflow-hidden px-2 sm:px-6"
        >
          {/* Left 5 Stepped Bars: 430u, 360u, 288u, 216u, 156u */}
          <div className="flex items-start gap-[calc(8*var(--u))]">
            {LEFT_BAR_HEIGHTS.map((h, i) => (
              <div
                key={`left-bar-${i}`}
                style={{
                  width: 'calc(88 * var(--u))',
                  height: `calc(${h} * var(--u))`,
                  background:
                    'linear-gradient(180deg, rgba(0, 210, 255, 0.16) 0%, rgba(16, 185, 129, 0.06) 62%, transparent 100%)',
                  borderLeft: '1px solid rgba(0, 210, 255, 0.08)',
                  borderRight: '1px solid rgba(0, 210, 255, 0.05)',
                }}
              />
            ))}
          </div>

          {/* Right 5 Stepped Bars: 156u, 216u, 288u, 360u, 430u */}
          <div className="flex items-start gap-[calc(8*var(--u))]">
            {RIGHT_BAR_HEIGHTS.map((h, i) => (
              <div
                key={`right-bar-${i}`}
                style={{
                  width: 'calc(88 * var(--u))',
                  height: `calc(${h} * var(--u))`,
                  background:
                    'linear-gradient(180deg, rgba(0, 210, 255, 0.16) 0%, rgba(16, 185, 129, 0.06) 62%, transparent 100%)',
                  borderLeft: '1px solid rgba(0, 210, 255, 0.05)',
                  borderRight: '1px solid rgba(0, 210, 255, 0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Inner Fisheye CRT Content Stage */}
        <div
          style={{
            filter: 'url(#crt-fisheye-filter)',
            transform: 'translateZ(0) rotateX(0.4deg)',
          }}
          className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden px-4 sm:px-8 pt-24 pb-16 flex flex-col items-center"
        >
          {/* Centered 1224u Content Column */}
          <div
            style={{
              width: isPhone ? '100%' : 'calc(1224 * var(--u))',
              maxWidth: '92vw',
            }}
            className="mx-auto flex flex-col items-center"
          >
            {/* A. Centered FAQ Header */}
            <div className="flex flex-col items-center text-center">
              {/* Pill Tag (97u x 48u) */}
              <div
                ref={pillTagRef}
                style={{
                  width: 'calc(97 * var(--u))',
                  height: 'calc(48 * var(--u))',
                  fontSize: 'calc(13 * var(--u))',
                  textShadow:
                    '-1px 0 rgba(255,0,80,0.22), 1px 0 rgba(0,210,255,0.28)',
                }}
                className="inline-flex items-center justify-center bg-[#00d2ff]/10 border border-[#00d2ff]/40 rounded-full font-mono tracking-[0.2em] uppercase text-[#7ce8ff] shadow-[0_0_20px_rgba(0,210,255,0.2)] mb-[calc(22*var(--u))]"
              >
                FAQ
              </div>

              {/* Headline */}
              <h2
                ref={headlineRef}
                style={{
                  fontSize: isPhone ? '30px' : 'calc(58 * var(--u))',
                  lineHeight: isPhone ? '38px' : 'calc(70 * var(--u))',
                  textShadow:
                    '-1px 0 rgba(255,0,80,0.22), 1px 0 rgba(0,210,255,0.28), 0 4px 28px rgba(0,0,0,0.65)',
                }}
                className="font-sans font-extrabold tracking-[-0.03em] text-white max-w-[22ch]"
              >
                Compare any website quote{' '}
                <span className="font-serif italic font-normal text-[#7ce8ff]">
                  with ours.
                </span>
              </h2>
            </div>

            {/* B. Refractive Glass Search Bar (56u below header) */}
            <div
              ref={searchWrapRef}
              style={{
                marginTop: isPhone ? '28px' : 'calc(56 * var(--u))',
                height: isPhone ? '54px' : 'calc(74 * var(--u))',
                background: 'rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: isSearchFocused
                  ? '1px solid #00d2ff'
                  : '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: isSearchFocused
                  ? '0 0 0 4px rgba(0, 210, 255, 0.18), 0 18px 40px rgba(0, 0, 0, 0.45)'
                  : '0 14px 34px rgba(0, 0, 0, 0.38)',
              }}
              className="w-full max-w-[calc(760*var(--u))] min-w-[280px] rounded-full px-6 flex items-center gap-3.5 transition-all duration-200"
            >
              <Search className="w-5 h-5 text-[#7ce8ff]/80 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search for your queries"
                aria-label="Search for your queries"
                style={{
                  fontSize: isPhone ? '15px' : 'calc(17 * var(--u))',
                }}
                className="w-full bg-transparent text-white placeholder:text-white/45 font-sans font-light focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* C. Smooth One-at-a-Time Accordion (48u below search, 1224u centered column) */}
            <div
              style={{
                marginTop: isPhone ? '24px' : 'calc(48 * var(--u))',
                gap: isPhone ? '12px' : 'calc(18 * var(--u))',
              }}
              className="w-full flex flex-col"
            >
              {filteredItems.length === 0 ? (
                <div
                  style={{
                    borderRadius: 'calc(14 * var(--u))',
                    background: 'rgba(16, 20, 30, 0.82)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                  className="w-full py-10 px-6 text-center font-sans text-white/70 text-base"
                >
                  No questions match your search.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isOpen = openId === item.id;
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        rowRefs.current[idx] = el;
                      }}
                      style={{
                        borderRadius: isPhone ? '12px' : 'calc(14 * var(--u))',
                        background: 'rgba(16, 20, 30, 0.82)',
                      }}
                      className={`w-full transition-all duration-300 border ${
                        isOpen
                          ? 'border-[#00d2ff]/60 shadow-[0_0_30px_rgba(0,210,255,0.12)]'
                          : 'border-white/10 hover:border-[#00d2ff]/45'
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => handleToggleRow(item.id)}
                        style={{
                          minHeight: isPhone ? '64px' : 'calc(82 * var(--u))',
                          paddingLeft: isPhone ? '20px' : 'calc(28 * var(--u))',
                          paddingRight: isPhone
                            ? '20px'
                            : 'calc(28 * var(--u))',
                        }}
                        className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                      >
                        <span
                          style={{
                            fontSize: isPhone
                              ? '17px'
                              : 'calc(23.6 * var(--u))',
                            textShadow:
                              '-0.5px 0 rgba(255,0,80,0.16), 0.5px 0 rgba(0,210,255,0.22)',
                          }}
                          className="font-sans font-medium text-white leading-snug"
                        >
                          {item.question}
                        </span>

                        <span
                          style={{
                            width: isPhone ? '32px' : 'calc(36 * var(--u))',
                            height: isPhone ? '32px' : 'calc(36 * var(--u))',
                          }}
                          className={`rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                            isOpen
                              ? 'rotate-180 bg-[#00d2ff] text-slate-950 border-[#00d2ff] shadow-[0_0_14px_rgba(0,210,255,0.5)]'
                              : 'rotate-0 bg-white/[0.03] text-white/80 border-white/[0.18]'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                        </span>
                      </button>

                      {/* One-at-a-Time 0fr -> 1fr CSS Grid Transition */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateRows: isOpen ? '1fr' : '0fr',
                          transition:
                            'grid-template-rows 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      >
                        <div className="overflow-hidden">
                          <div
                            style={{
                              paddingLeft: isPhone
                                ? '20px'
                                : 'calc(28 * var(--u))',
                              paddingRight: isPhone
                                ? '20px'
                                : 'calc(28 * var(--u))',
                              paddingBottom: isPhone
                                ? '16px'
                                : 'calc(22 * var(--u))',
                            }}
                          >
                            <div
                              style={{
                                fontSize: isPhone
                                  ? '15px'
                                  : 'calc(17 * var(--u))',
                                lineHeight: isPhone
                                  ? '23px'
                                  : 'calc(26 * var(--u))',
                                paddingBottom: isPhone
                                  ? '14px'
                                  : 'calc(20 * var(--u))',
                              }}
                              className="font-sans text-white/[0.82] border-b border-[#2a3241]"
                            >
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live 60fps CRT Static Snow / Grain Canvas Overlay */}
        <canvas
          ref={grainCanvasRef}
          aria-hidden="true"
          style={{opacity: 0.035}}
          className="z-30 absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
        />

        {/* Fine Horizontal CRT Scanlines Overlay */}
        <div
          aria-hidden="true"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.28) 3px)',
          }}
          className="z-30 absolute inset-0 pointer-events-none"
        />

        {/* Subtle Vertical CRT Phosphor Refresh Roll Bar (6s cycle) */}
        <div
          ref={rollBarRef}
          aria-hidden="true"
          style={{top: '-15%'}}
          className="z-30 absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-[#00d2ff]/[0.045] to-transparent pointer-events-none"
        />

        {/* Diagonal Curved CRT Glass Reflection Sheen */}
        <div
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(125deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 28%, transparent 52%, rgba(0,210,255,0.03) 100%)',
          }}
          className="z-30 absolute inset-0 pointer-events-none"
        />

        {/* Phase C Turn-On Analog Static Burst Flash Layer */}
        <div
          ref={staticFlashRef}
          aria-hidden="true"
          style={{opacity: 0}}
          className="z-40 absolute inset-0 bg-[radial-gradient(circle_at_center,#e0f9ff_0%,#00d2ff_45%,#05070e_100%)] mix-blend-screen pointer-events-none"
        />
      </div>
    </div>
  );
}
