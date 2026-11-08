'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Play, X, ArrowUpRight, ChevronDown} from 'lucide-react';
import type {NavSectionKey} from './Navbar';
import {LiquidGlassSurface} from './LiquidGlass';
import {
  SplitWords,
  useCharacterVectors,
  getScrambledChar,
  AsteriskGlyph,
  LightningGlyph,
  BezierSplineBadge,
  SpringCoilGlyph,
} from './KineticText';
import ProjectDetailModal, {
  type FlagshipProject,
} from './ProjectDetailModal';
import WorkRibbonCanvas from './WorkRibbonCanvas';
import CrtFaqSection from './CrtFaqSection';

interface HeroProps {
  onPhaseChange: (phase: NavSectionKey | null, isNight: boolean) => void;
  onOpenBooking: (defaultTrack?: string) => void;
}

const TOTAL_FRAMES = 180;

const STAGE_ANCHORS: {
  id: string;
  label: string;
  navKey: NavSectionKey;
  scrollTarget: number;
}[] = [
  {id: '01', label: 'Portal', navKey: 'Services', scrollTarget: 0.13},
  {id: '02', label: 'Studio', navKey: 'Works', scrollTarget: 0.26},
  {id: '03', label: 'Warp', navKey: 'AI Solutions', scrollTarget: 0.39},
  {id: '04', label: 'Horizon', navKey: 'Philosophy', scrollTarget: 0.49},
];

const HERO_EYEBROW_TEXT = 'VIXA DIGITAL AGENCY — WEB, UI/UX & AI';
const HERO_EYEBROW_GLYPHS = ['*', '/', '0', '1', '_'];

// Stage 0 character strings
const S0_LINE1 = 'Architecting';
const S0_LINE2 = 'the future';
const S0_LINE3_PREFIX = 'of';
const S0_LINE3_PILL = 'intelligent web.';
const S0_FULL_TEXT = `${S0_LINE1} ${S0_LINE2} ${S0_LINE3_PREFIX} ${S0_LINE3_PILL}`;
const S0_CHAR_STREAM =
  S0_LINE1 +
  S0_LINE2.replace(/ /g, '') +
  S0_LINE3_PREFIX +
  S0_LINE3_PILL.replace(/ /g, '');

// Phase 1 character strings
const P1_PART1 = 'Where interface meets';
const P1_PART2 = 'deep architecture.';
const P1_FULL_TEXT = `${P1_PART1} ${P1_PART2}`;
const P1_CHAR_STREAM =
  P1_PART1.replace(/ /g, '') + P1_PART2.replace(/ /g, '');

// Phase 2 character strings
const P2_PART1 = 'Architected by';
const P2_PILL1 = 'obsessive';
const P2_PILL2 = 'minds.';
const P2_FULL_TEXT = `${P2_PART1} ${P2_PILL1} ${P2_PILL2}`;
const P2_CHAR_STREAM =
  P2_PART1.replace(/ /g, '') + P2_PILL1 + P2_PILL2;

// Phase 3 character strings
const P3_PART1 = 'Accelerated at the speed';
const P3_PART2 = 'of';
const P3_PILL = 'intelligence.';
const P3_FULL_TEXT = `${P3_PART1} ${P3_PART2} ${P3_PILL}`;
const P3_CHAR_STREAM =
  P3_PART1.replace(/ /g, '') + P3_PART2 + P3_PILL;

// Phase 4 character strings
const P4_PART1 = 'Built for the';
const P4_PILL = 'infinite horizon.';
const P4_FULL_TEXT = `${P4_PART1} ${P4_PILL}`;
const P4_CHAR_STREAM =
  P4_PART1.replace(/ /g, '') + P4_PILL.replace(/ /g, '');

// Stage 5 character strings
const S5_EYEBROW = '05 // SELECTED WORKS';
const S5_PART1 = 'Crafted in';
const S5_PILL = 'motion.';
const S5_FULL_HEADLINE = `${S5_PART1} ${S5_PILL}`;
const S5_CHAR_STREAM =
  S5_PART1.replace(/ /g, '') + S5_PILL.replace(/ /g, '');

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/**
 * Elastic spring overshoot easing for GSAP-style pill and character pops
 */
function easeOutBack(t: number, overshoot = 1.56): number {
  const c = clamp01(t);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

/**
 * Draws an ImageBitmap or HTMLVideoElement onto a 2D canvas with CSS `object-fit: cover` math.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap | HTMLVideoElement,
  canvasW: number,
  canvasH: number,
  sourceW: number,
  sourceH: number
) {
  if (!sourceW || !sourceH || !canvasW || !canvasH) return;
  const scale = Math.max(canvasW / sourceW, canvasH / sourceH);
  const drawW = sourceW * scale;
  const drawH = sourceH * scale;
  const offsetX = (canvasW - drawW) * 0.5;
  const offsetY = (canvasH - drawH) * 0.5;
  ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
}

export default function Hero({onPhaseChange, onOpenBooking}: HeroProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const meadowWrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dayVideoRef = useRef<HTMLVideoElement | null>(null);
  const nightVideoRef = useRef<HTMLVideoElement | null>(null);
  const roomVideoRef = useRef<HTMLVideoElement | null>(null);
  const dayLayerRef = useRef<HTMLDivElement | null>(null);

  // Stage 0 (Hero) Kinetic Refs
  const s0EyebrowRef = useRef<HTMLSpanElement | null>(null);
  const s0CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const s0PinwheelRef = useRef<HTMLSpanElement | null>(null);
  const s0CoilRef = useRef<SVGSVGElement | null>(null);
  const s0AsteriskRef = useRef<SVGSVGElement | null>(null);
  const s0PillRef = useRef<HTMLSpanElement | null>(null);
  const s0BezierPathRef = useRef<SVGPathElement | null>(null);

  // Phase 1 Kinetic Refs
  const phase1Ref = useRef<HTMLDivElement | null>(null);
  const p1CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const p1PillRef = useRef<HTMLSpanElement | null>(null);
  const p1BezierWrapRef = useRef<HTMLSpanElement | null>(null);
  const p1BezierPathRef = useRef<SVGPathElement | null>(null);

  // Phase 2 Kinetic Refs (Bottom-Center Dock below the desk & keyboard)
  const phase2DockRef = useRef<HTMLDivElement | null>(null);
  const p2CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const p2ObsessivePillRef = useRef<HTMLSpanElement | null>(null);
  const p2MindsPillRef = useRef<HTMLSpanElement | null>(null);
  const p2AsteriskRef = useRef<SVGSVGElement | null>(null);
  const p2LeftBodyRef = useRef<HTMLSpanElement | null>(null);
  const p2RightBodyRef = useRef<HTMLSpanElement | null>(null);

  // Phase 3 Kinetic Refs
  const phase3Ref = useRef<HTMLDivElement | null>(null);
  const p3CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const p3BoltRef = useRef<SVGSVGElement | null>(null);
  const p3PillRef = useRef<HTMLSpanElement | null>(null);

  // Phase 4 Kinetic Refs
  const phase4Ref = useRef<HTMLDivElement | null>(null);
  const phase4HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const p4CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const p4PinwheelRef = useRef<HTMLSpanElement | null>(null);
  const p4CoilRef = useRef<SVGSVGElement | null>(null);
  const p4PillRef = useRef<HTMLSpanElement | null>(null);
  const p4CtaRowRef = useRef<HTMLDivElement | null>(null);

  // Stage 5 (Three.js GLSL Work Ribbon Showcase) Refs inside the SAME sticky stage
  const stage5LayerRef = useRef<HTMLDivElement | null>(null);
  const s5HeaderRef = useRef<HTMLDivElement | null>(null);
  const s5CharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ribbonTwistRef = useRef<number>(0);

  // Progress Rail Refs
  const railRef = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);

  // Deterministic character physics vectors
  const s0Vectors = useCharacterVectors(S0_CHAR_STREAM, 11);
  const p1Vectors = useCharacterVectors(P1_CHAR_STREAM, 23);
  const p2Vectors = useCharacterVectors(P2_CHAR_STREAM, 37);
  const p3Vectors = useCharacterVectors(P3_CHAR_STREAM, 53);
  const p4Vectors = useCharacterVectors(P4_CHAR_STREAM, 71);
  const s5Vectors = useCharacterVectors(S5_CHAR_STREAM, 89);

  // Pre-decoded GPU ImageBitmap frame buffer for 0ms instant scrubbing
  const framesRef = useRef<(ImageBitmap | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  const hasAnyBitmapRef = useRef<boolean>(false);

  // Inertial scroll state (Lenis-style exponential damping for a silky cushioned stop)
  const targetScrollRef = useRef<number>(0);
  const smoothScrollRef = useRef<number>(0);
  const stage6ProgressRef = useRef<number>(0);
  const asteriskAngleRef = useRef<number>(0);
  const mountStartRef = useRef<number | null>(null);
  const lastFrameIndexDrawnRef = useRef<number>(-1);
  const lastPhaseRef = useRef<NavSectionKey | null>(null);
  const lastNightRef = useRef<boolean>(false);
  const dayPausedRef = useRef<boolean>(false);
  const nightPausedRef = useRef<boolean>(false);
  const roomPlayingRef = useRef<boolean>(false);

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [selectedProject, setSelectedProject] =
    useState<FlagshipProject | null>(null);
  const [workreelOpen, setWorkreelOpen] = useState<boolean>(false);

  // 1. Two-Pass Background Frame Extractor into GPU ImageBitmap[]
  useEffect(() => {
    let cancelled = false;
    const extractor = document.createElement('video');
    extractor.src = '/assets/aistudio/Scroll_Animation_b9c5da2e.mp4';
    extractor.muted = true;
    extractor.playsInline = true;
    extractor.preload = 'auto';
    extractor.crossOrigin = 'anonymous';

    const seekAndCapture = (index: number, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelled || framesRef.current[index]) {
          resolve();
          return;
        }
        const time = Math.min(
          duration - 0.02,
          Math.max(0, (index / (TOTAL_FRAMES - 1)) * duration)
        );

        const onSeeked = async () => {
          extractor.removeEventListener('seeked', onSeeked);
          if (cancelled) {
            resolve();
            return;
          }
          try {
            const bmp = await createImageBitmap(extractor, {
              resizeWidth: 1280,
              resizeHeight: 720,
              resizeQuality: 'medium',
            });
            if (!cancelled) {
              framesRef.current[index] = bmp;
              hasAnyBitmapRef.current = true;
              lastFrameIndexDrawnRef.current = -1;
            } else {
              bmp.close();
            }
          } catch {
            // Ignore frame decode error
          }
          resolve();
        };

        extractor.addEventListener('seeked', onSeeked, {once: true});
        extractor.currentTime = time;
      });
    };

    const startExtraction = async () => {
      const duration = extractor.duration;
      if (!duration || !isFinite(duration) || duration <= 0) return;

      // Pass 1: Coarse keyframes across the full clip (~300ms)
      for (let i = 0; i < TOTAL_FRAMES; i += 6) {
        if (cancelled) return;
        await seekAndCapture(i, duration);
      }
      await seekAndCapture(TOTAL_FRAMES - 1, duration);

      // Pass 2: Dense intermediate frames for silky sub-frame scrubbing
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (cancelled) return;
        if (!framesRef.current[i]) {
          await seekAndCapture(i, duration);
        }
      }
    };

    if (extractor.readyState >= 1) {
      startExtraction();
    } else {
      extractor.addEventListener('loadedmetadata', startExtraction, {
        once: true,
      });
    }

    const currentFrames = framesRef.current;
    return () => {
      cancelled = true;
      extractor.src = '';
      for (let i = 0; i < currentFrames.length; i++) {
        currentFrames[i]?.close();
        currentFrames[i] = null;
      }
    };
  }, []);

  // 2. Unified 60/120fps Master Scroll Timeline (0.00 -> 1.00 across 850dvh)
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(window.innerWidth * dpr);
      const targetH = Math.round(window.innerHeight * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        lastFrameIndexDrawnRef.current = -1;
      }
    };

    const handleScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetScrollRef.current = clamp01(window.scrollY / maxScroll);
    };

    syncCanvasSize();
    handleScroll();

    window.addEventListener('resize', syncCanvasSize, {passive: true});
    window.addEventListener('scroll', handleScroll, {passive: true});

    const l1Len = S0_LINE1.length;
    const l2Len = S0_LINE2.replace(/ /g, '').length;
    const l1End = l1Len;
    const l2End = l1End + l2Len;

    const p2Part1Len = P2_PART1.replace(/ /g, '').length;

    const renderLoop = (now: number) => {
      if (mountStartRef.current === null) {
        mountStartRef.current = now;
      }
      const mountElapsed = now - mountStartRef.current;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Lenis-style exponential scroll damping: silky glide + cushioned stop
      const target = targetScrollRef.current;
      const current = smoothScrollRef.current;
      const diff = target - current;
      const decay = 1 - Math.exp(-7.5 * dt);
      const s = Math.abs(diff) < 0.00005 ? target : current + diff * decay;
      const scrollVelocity = (s - current) / dt;
      smoothScrollRef.current = s;

      // Accumulate asterisk spin from both ambient time and scroll velocity
      asteriskAngleRef.current =
        (asteriskAngleRef.current +
          dt * 42 +
          Math.abs(scrollVelocity) * 680 * dt) %
        360;

      // ─────────────────────────────────────────────────────────────────────
      // STAGE 0: Daytime Hero to Night Meadow Sunset Crossfade (0.00 – 0.08)
      // ─────────────────────────────────────────────────────────────────────
      const sunsetT = clamp01(s / 0.08);
      const dayOpacity = 1 - sunsetT;

      if (dayLayerRef.current) {
        dayLayerRef.current.style.opacity = dayOpacity.toFixed(4);
        const dayBlur = (sunsetT * 6).toFixed(2);
        const dayScale = (1 + sunsetT * 0.03).toFixed(4);
        dayLayerRef.current.style.filter =
          sunsetT > 0.005 ? `blur(${dayBlur}px)` : 'none';
        dayLayerRef.current.style.transform = `scale(${dayScale})`;
        dayLayerRef.current.style.pointerEvents =
          dayOpacity < 0.05 ? 'none' : 'auto';
        dayLayerRef.current.style.visibility =
          s >= 0.08 ? 'hidden' : 'visible';
      }

      // Eyebrow 600ms scramble decode on mount
      if (s0EyebrowRef.current) {
        if (mountElapsed < 600) {
          const scrambleP = clamp01(mountElapsed / 600);
          const revealCount = Math.floor(scrambleP * HERO_EYEBROW_TEXT.length);
          let out = '';
          for (let i = 0; i < HERO_EYEBROW_TEXT.length; i++) {
            const ch = HERO_EYEBROW_TEXT[i];
            if (ch === ' ' || i <= revealCount) {
              out += ch;
            } else {
              const gIdx =
                (i + Math.floor(mountElapsed / 40)) % HERO_EYEBROW_GLYPHS.length;
              out += HERO_EYEBROW_GLYPHS[gIdx];
            }
          }
          if (s0EyebrowRef.current.textContent !== out) {
            s0EyebrowRef.current.textContent = out;
          }
        } else if (s0EyebrowRef.current.textContent !== HERO_EYEBROW_TEXT) {
          s0EyebrowRef.current.textContent = HERO_EYEBROW_TEXT;
        }
      }

      if (s <= 0.09) {
        const isMounting = mountElapsed < 1750;
        const isScattering = sunsetT > 0.001 && sunsetT < 0.999;
        const activeWillChange =
          isMounting || isScattering ? 'transform, opacity' : 'auto';

        for (let i = 0; i < s0Vectors.length; i++) {
          const el = s0CharRefs.current[i];
          if (!el) continue;
          const vec = s0Vectors[i];

          let tx = 0;
          let ty = 0;
          let tz = 0;
          let rot = 0;
          let sc = 1;
          let op = 1;

          if (i < l1End) {
            const delay = 80 + i * 45;
            const rawP = clamp01((mountElapsed - delay) / 560);
            const easeP = easeOutBack(rawP, 1.56);
            ty = (1 - easeP) * 115;
            rot = (1 - easeP) * 12;
            sc = 0.7 + 0.3 * easeP;
            op = clamp01(rawP * 2.2);

            const scatterX = vec.offsetX * sunsetT;
            const scatterY = vec.offsetY * sunsetT;
            tz = 80 * sunsetT;
            rot += vec.rot * sunsetT;
            op *= 1 - sunsetT * 0.95;

            el.style.willChange = activeWillChange;
            el.style.opacity = op.toFixed(3);
            el.style.transform = `translate3d(${scatterX.toFixed(
              1
            )}px, calc(${ty.toFixed(1)}% + ${scatterY.toFixed(
              1
            )}px), ${tz.toFixed(1)}px) rotateZ(${rot.toFixed(
              1
            )}deg) scale(${sc.toFixed(3)})`;
          } else if (i < l2End) {
            const cIdx = i - l1End;
            const delay = 340 + cIdx * 38;
            const rawP = clamp01((mountElapsed - delay) / 560);
            const easeP = easeOutBack(rawP, 1.35);

            tx = vec.offsetX * (1 - easeP) + vec.offsetX * sunsetT;
            ty = vec.offsetY * (1 - easeP) + vec.offsetY * sunsetT;
            tz = 80 * sunsetT;
            rot = vec.rot * (1 - easeP) + vec.rot * sunsetT;
            op = clamp01(rawP * 1.8) * (1 - sunsetT * 0.95);

            el.style.willChange = activeWillChange;
            el.style.opacity = op.toFixed(3);
            el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(
              1
            )}px, ${tz.toFixed(1)}px) rotateZ(${rot.toFixed(1)}deg)`;
          } else {
            const cIdx = i - l2End;
            const delay = 620 + cIdx * 32;
            const rawP = clamp01((mountElapsed - delay) / 520);
            const easeP = easeOutBack(rawP, 1.4);
            const waveY = (1 - easeP) * 100;
            const scatterX = vec.offsetX * sunsetT;
            const scatterY = vec.offsetY * sunsetT;
            tz = 80 * sunsetT;
            rot = vec.rot * sunsetT;
            op = clamp01(rawP * 2.0) * (1 - sunsetT * 0.95);

            el.style.willChange = activeWillChange;
            el.style.opacity = op.toFixed(3);
            el.style.transform = `translate3d(${scatterX.toFixed(
              1
            )}px, calc(${waveY.toFixed(1)}% + ${scatterY.toFixed(
              1
            )}px), ${tz.toFixed(1)}px) rotateZ(${rot.toFixed(1)}deg)`;
          }
        }

        if (s0PinwheelRef.current) {
          const pwP = clamp01((mountElapsed - 320) / 520);
          const pwScale = easeOutBack(pwP, 2.4);
          s0PinwheelRef.current.style.transform = `scale(${pwScale.toFixed(
            3
          )})`;
        }

        if (s0CoilRef.current) {
          const coilP = clamp01((mountElapsed - 480) / 620);
          const coilScaleY =
            coilP < 1
              ? easeOutBack(coilP, 2.2)
              : 1 + Math.sin(now * 0.004) * 0.08;
          s0CoilRef.current.style.transform = `scaleY(${coilScaleY.toFixed(
            3
          )}) rotateZ(${(sunsetT * 35).toFixed(1)}deg)`;
        }

        if (s0AsteriskRef.current) {
          const astP = clamp01((mountElapsed - 580) / 480);
          const astScale = easeOutBack(astP, 1.8);
          s0AsteriskRef.current.style.transform = `scale(${astScale.toFixed(
            3
          )}) rotateZ(${asteriskAngleRef.current.toFixed(1)}deg)`;
        }

        if (s0PillRef.current) {
          const pillP = smoothstep(clamp01((mountElapsed - 660) / 640));
          const rightInset = ((1 - pillP) * 100).toFixed(1);
          s0PillRef.current.style.clipPath = `inset(0 ${rightInset}% 0 0 round 16px)`;
        }

        if (s0BezierPathRef.current) {
          const bezP = smoothstep(clamp01((mountElapsed - 880) / 650));
          s0BezierPathRef.current.style.strokeDashoffset = (
            96 *
            (1 - bezP)
          ).toFixed(1);
        }
      } else {
        for (let i = 0; i < s0Vectors.length; i++) {
          const el = s0CharRefs.current[i];
          if (el && el.style.willChange !== 'auto') {
            el.style.willChange = 'auto';
          }
        }
      }

      // Guardrail 1: Pause Daytime Hero video & set display:none once s >= 0.08
      const shouldPauseDay = s >= 0.08;
      if (shouldPauseDay !== dayPausedRef.current) {
        dayPausedRef.current = shouldPauseDay;
        if (dayVideoRef.current) {
          if (shouldPauseDay) {
            dayVideoRef.current.pause();
            dayVideoRef.current.style.display = 'none';
          } else {
            dayVideoRef.current.style.display = 'block';
            dayVideoRef.current.play().catch(() => {});
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // CANVAS VIDEO SCRUBBING (Scroll 0.08 – 0.54 | Video 0.0s – End)
      // ─────────────────────────────────────────────────────────────────────
      const scrubProgress = clamp01((s - 0.08) / 0.46);
      const exactFrame = scrubProgress * (TOTAL_FRAMES - 1);

      const canvas = canvasRef.current;
      if (
        canvas &&
        s < 0.61 &&
        Math.abs(exactFrame - lastFrameIndexDrawnRef.current) > 0.002
      ) {
        const ctx = canvas.getContext('2d', {alpha: false});
        if (ctx) {
          const frames = framesRef.current;
          if (hasAnyBitmapRef.current) {
            const floorIdx = Math.floor(exactFrame);
            const ceilIdx = Math.min(TOTAL_FRAMES - 1, Math.ceil(exactFrame));

            let idxA = floorIdx;
            while (idxA > 0 && !frames[idxA]) idxA--;
            if (!frames[idxA]) {
              while (idxA < TOTAL_FRAMES - 1 && !frames[idxA]) idxA++;
            }

            let idxB = ceilIdx;
            while (idxB < TOTAL_FRAMES - 1 && !frames[idxB]) idxB++;
            if (!frames[idxB]) idxB = idxA;

            const bmpA = frames[idxA];
            const bmpB = frames[idxB];

            if (bmpA) {
              ctx.globalAlpha = 1;
              drawCover(
                ctx,
                bmpA,
                canvas.width,
                canvas.height,
                bmpA.width,
                bmpA.height
              );

              if (bmpB && idxB !== idxA) {
                const blendAlpha = clamp01(
                  (exactFrame - idxA) / (idxB - idxA)
                );
                if (blendAlpha > 0.01) {
                  ctx.globalAlpha = blendAlpha;
                  drawCover(
                    ctx,
                    bmpB,
                    canvas.width,
                    canvas.height,
                    bmpB.width,
                    bmpB.height
                  );
                  ctx.globalAlpha = 1;
                }
              }
              lastFrameIndexDrawnRef.current = exactFrame;
            }
          } else if (
            nightVideoRef.current &&
            nightVideoRef.current.readyState >= 2
          ) {
            const vid = nightVideoRef.current;
            ctx.globalAlpha = 1;
            drawCover(
              ctx,
              vid,
              canvas.width,
              canvas.height,
              vid.videoWidth || 1280,
              vid.videoHeight || 720
            );
          }
        }
      }

      const nightVideo = nightVideoRef.current;
      if (
        !hasAnyBitmapRef.current &&
        nightVideo &&
        s < 0.6 &&
        nightVideo.duration > 0 &&
        nightVideo.readyState >= 2 &&
        !nightVideo.seeking
      ) {
        const targetVideoTime =
          s < 0.08 ? 0 : scrubProgress * nightVideo.duration;
        if (Math.abs(nightVideo.currentTime - targetVideoTime) > 0.04) {
          nightVideo.currentTime = targetVideoTime;
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 1: The Night Meadow & CRT Portal (Scroll 0.08 – 0.19)
      // ─────────────────────────────────────────────────────────────────────
      if (phase1Ref.current) {
        if (s < 0.07 || s > 0.2) {
          phase1Ref.current.style.opacity = '0';
          phase1Ref.current.style.visibility = 'hidden';
          for (let i = 0; i < p1Vectors.length; i++) {
            const el = p1CharRefs.current[i];
            if (el && el.style.willChange !== 'auto') {
              el.style.willChange = 'auto';
            }
          }
        } else {
          phase1Ref.current.style.visibility = 'visible';
          const p1 = clamp01((s - 0.08) / 0.11);
          const isActivelyScrollingP1 = p1 > 0 && p1 < 1;
          const charWillChange = isActivelyScrollingP1
            ? 'transform, opacity'
            : 'auto';

          let containerOp = 1;
          let containerBlur = 0;
          if (p1 < 0.2) {
            containerOp = smoothstep(p1 / 0.2);
            containerBlur = (1 - containerOp) * 8;
          } else if (p1 > 0.72) {
            const x = smoothstep((p1 - 0.72) / 0.28);
            containerOp = 1 - x;
            containerBlur = x * 12;
          }

          phase1Ref.current.style.opacity = containerOp.toFixed(3);
          phase1Ref.current.style.filter =
            containerBlur > 0.15 ? `blur(${containerBlur.toFixed(2)}px)` : 'none';

          const exitT = p1 > 0.72 ? smoothstep((p1 - 0.72) / 0.28) : 0;
          for (let i = 0; i < p1Vectors.length; i++) {
            const el = p1CharRefs.current[i];
            if (!el) continue;
            const vec = p1Vectors[i];

            const staggerStart = i * 0.0065;
            const localIn = clamp01((p1 - staggerStart) / 0.22);
            const eIn = easeOutBack(localIn, 1.35);

            const slotY = (1 - eIn) * 115;
            const rotX = (1 - eIn) * -80;
            const flyX = vec.radialX * exitT * 1.15;
            const flyY = vec.radialY * exitT * 1.15;
            const flyScale = 1 + exitT * 0.35;
            const charOp = clamp01(localIn * 2.2) * (1 - exitT * 0.9);

            el.style.willChange = charWillChange;
            el.style.opacity = charOp.toFixed(3);
            el.style.transform = `perspective(500px) translate3d(${flyX.toFixed(
              1
            )}px, calc(${slotY.toFixed(1)}% + ${flyY.toFixed(
              1
            )}px), 0) rotateX(${rotX.toFixed(1)}deg) scale(${flyScale.toFixed(
              3
            )})`;
          }

          if (p1PillRef.current) {
            const pillIn = easeOutBack(clamp01((p1 - 0.08) / 0.22), 1.25);
            p1PillRef.current.style.transform = `scaleX(${pillIn.toFixed(3)})`;
          }

          if (p1BezierPathRef.current) {
            const drawP = smoothstep(clamp01((p1 - 0.1) / 0.22));
            p1BezierPathRef.current.style.strokeDashoffset = (
              96 *
              (1 - drawP)
            ).toFixed(1);
          }
          if (p1BezierWrapRef.current) {
            const floatY = Math.sin(now * 0.0032) * 4;
            p1BezierWrapRef.current.style.transform = `translateY(${floatY.toFixed(
              1
            )}px)`;
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 2: Inside the Engineering Studio (Scroll 0.20 – 0.33)
      // ─────────────────────────────────────────────────────────────────────
      if (phase2DockRef.current) {
        if (s < 0.19 || s > 0.345) {
          phase2DockRef.current.style.opacity = '0';
          phase2DockRef.current.style.visibility = 'hidden';
          for (let i = 0; i < p2Vectors.length; i++) {
            const el = p2CharRefs.current[i];
            if (el && el.style.willChange !== 'auto') {
              el.style.willChange = 'auto';
            }
          }
        } else {
          phase2DockRef.current.style.visibility = 'visible';
          const p2 = clamp01((s - 0.2) / 0.13);
          const isActivelyScrollingP2 = p2 > 0 && p2 < 1;
          const charWillChange = isActivelyScrollingP2
            ? 'transform, opacity'
            : 'auto';

          let dockOp = 1;
          let dockBlur = 0;
          let dockY = 0;
          if (p2 < 0.22) {
            const e = smoothstep(p2 / 0.22);
            dockOp = e;
            dockY = (1 - e) * 22;
            dockBlur = (1 - e) * 8;
          } else if (p2 > 0.75) {
            const x = smoothstep((p2 - 0.75) / 0.25);
            dockOp = 1 - x;
            dockY = x * 18;
            dockBlur = x * 10;
          }

          phase2DockRef.current.style.opacity = dockOp.toFixed(3);
          phase2DockRef.current.style.transform = `translate3d(0, ${dockY.toFixed(
            1
          )}px, 0)`;
          phase2DockRef.current.style.filter =
            dockBlur > 0.15 ? `blur(${dockBlur.toFixed(2)}px)` : 'none';

          const curtainExit = p2 > 0.75 ? smoothstep((p2 - 0.75) / 0.25) : 0;

          for (let i = 0; i < p2Vectors.length; i++) {
            const el = p2CharRefs.current[i];
            if (!el) continue;

            const stagger = i * 0.007;
            const localIn = clamp01((p2 - stagger) / 0.22);
            const eIn = easeOutBack(localIn, 1.4);

            const rotY = (1 - eIn) * -90;
            const scIn = 0.8 + 0.2 * eIn;

            const isLeftHalf = i < p2Part1Len;
            const curtainX = (isLeftHalf ? -60 : 60) * curtainExit;
            const scExit = scIn * (1 + curtainExit * 0.2);

            el.style.willChange = charWillChange;
            el.style.opacity = clamp01(localIn * 2.2).toFixed(3);
            el.style.transform = `perspective(500px) translate3d(${curtainX.toFixed(
              1
            )}px, 0, 0) rotateY(${rotY.toFixed(1)}deg) scale(${scExit.toFixed(
              3
            )})`;
          }

          if (p2ObsessivePillRef.current) {
            const pill1In = easeOutBack(clamp01((p2 - 0.07) / 0.22), 1.9);
            const pill1Scale = 0.4 + 0.6 * pill1In;
            const straighten = smoothstep(clamp01((p2 - 0.22) / 0.28));
            const tilt = -2.2 * (1 - straighten * 0.65) - curtainExit * 6;
            const cX = -38 * curtainExit;
            p2ObsessivePillRef.current.style.transform = `translate3d(${cX.toFixed(
              1
            )}px, 0, 0) scale(${(pill1Scale * (1 + curtainExit * 0.18)).toFixed(
              3
            )}) rotateZ(${tilt.toFixed(2)}deg)`;
          }

          if (p2MindsPillRef.current) {
            const pill2In = easeOutBack(clamp01((p2 - 0.12) / 0.22), 1.9);
            const pill2Scale = 0.4 + 0.6 * pill2In;
            const straighten = smoothstep(clamp01((p2 - 0.24) / 0.28));
            const tilt = 1.8 * (1 - straighten * 0.65) + curtainExit * 6;
            const cX = 48 * curtainExit;
            p2MindsPillRef.current.style.transform = `translate3d(${cX.toFixed(
              1
            )}px, 0, 0) scale(${(pill2Scale * (1 + curtainExit * 0.18)).toFixed(
              3
            )}) rotateZ(${tilt.toFixed(2)}deg)`;
          }

          if (p2AsteriskRef.current) {
            p2AsteriskRef.current.style.transform = `rotateZ(${(
              asteriskAngleRef.current * 1.35
            ).toFixed(1)}deg)`;
          }

          if (p2LeftBodyRef.current && p2RightBodyRef.current) {
            p2LeftBodyRef.current.style.transform = `translateX(${(
              -55 * curtainExit
            ).toFixed(1)}px)`;
            p2RightBodyRef.current.style.transform = `translateX(${(
              55 * curtainExit
            ).toFixed(1)}px)`;
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 3: The Code IDE & Lightspeed AI Warp (Scroll 0.34 – 0.44)
      // ─────────────────────────────────────────────────────────────────────
      if (phase3Ref.current) {
        if (s < 0.33 || s > 0.455) {
          phase3Ref.current.style.opacity = '0';
          phase3Ref.current.style.visibility = 'hidden';
          for (let i = 0; i < p3Vectors.length; i++) {
            const el = p3CharRefs.current[i];
            if (el && el.style.willChange !== 'auto') {
              el.style.willChange = 'auto';
            }
          }
        } else {
          phase3Ref.current.style.visibility = 'visible';
          const p3 = clamp01((s - 0.34) / 0.1);
          const isActivelyScrollingP3 = p3 > 0 && p3 < 1;
          const charWillChange = isActivelyScrollingP3
            ? 'transform, opacity'
            : 'auto';

          let op = 1;
          let bl = 0;
          if (p3 < 0.22) {
            const e = smoothstep(p3 / 0.22);
            op = e;
            bl = (1 - e) * 8;
          } else if (p3 > 0.72) {
            const x = smoothstep((p3 - 0.72) / 0.28);
            op = 1 - x;
            bl = x * 14;
          }

          const zoomScale = 0.88 + p3 * 0.54;
          phase3Ref.current.style.opacity = op.toFixed(3);
          phase3Ref.current.style.transform = `scale(${zoomScale.toFixed(4)})`;
          phase3Ref.current.style.filter =
            bl > 0.15 ? `blur(${bl.toFixed(2)}px)` : 'none';

          const radialOut = p3 > 0.72 ? smoothstep((p3 - 0.72) / 0.28) : 0;

          for (let i = 0; i < p3Vectors.length; i++) {
            const el = p3CharRefs.current[i];
            if (!el) continue;
            const vec = p3Vectors[i];

            const charDecodeP = clamp01((p3 - i * 0.004) / 0.22);
            const displayChar = getScrambledChar(
              vec.char,
              vec.scrambleSeed,
              charDecodeP
            );
            if (el.textContent !== displayChar) {
              el.textContent = displayChar;
            }

            const rx = vec.radialX * radialOut * 1.25;
            const ry = vec.radialY * radialOut * 1.25;

            el.style.willChange = charWillChange;
            el.style.transform =
              radialOut > 0.001
                ? `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`
                : 'translate3d(0,0,0)';
          }

          if (p3BoltRef.current) {
            const boltIn = easeOutBack(clamp01((p3 - 0.08) / 0.2), 2.3);
            const pulse = 1 + Math.sin(now * 0.014) * 0.09;
            p3BoltRef.current.style.transform = `scale(${(
              boltIn * pulse
            ).toFixed(3)}) rotateZ(${(Math.sin(now * 0.01) * 6).toFixed(
              1
            )}deg)`;
          }

          if (p3PillRef.current) {
            const pillIn = easeOutBack(clamp01((p3 - 0.12) / 0.22), 1.45);
            p3PillRef.current.style.transform = `scale(${pillIn.toFixed(3)})`;
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 4: The Open Night Meadow Finale (Scroll 0.45 – 0.54)
      // ─────────────────────────────────────────────────────────────────────
      const handoffP = smoothstep(clamp01((s - 0.54) / 0.05)); // 0.54 -> 0.59

      if (phase4Ref.current) {
        if (s < 0.44 || s > 0.595) {
          phase4Ref.current.style.opacity = '0';
          phase4Ref.current.style.visibility = 'hidden';
          phase4Ref.current.style.pointerEvents = 'none';
          for (let i = 0; i < p4Vectors.length; i++) {
            const el = p4CharRefs.current[i];
            if (el && el.style.willChange !== 'auto') {
              el.style.willChange = 'auto';
            }
          }
        } else {
          phase4Ref.current.style.visibility = 'visible';
          const p4 = clamp01((s - 0.45) / 0.09);
          const e = smoothstep(clamp01(p4 / 0.45));

          const isGatheringP4 = p4 > 0 && p4 < 0.48;
          const charWillChange = isGatheringP4 ? 'transform, opacity' : 'auto';

          const baseOp = clamp01(p4 / 0.25);
          const fadeOutOp = baseOp * (1 - handoffP);
          const recededScale = 1 - handoffP * 0.08;

          phase4Ref.current.style.opacity = fadeOutOp.toFixed(3);
          phase4Ref.current.style.transform = `scale(${recededScale.toFixed(
            4
          )})`;
          phase4Ref.current.style.pointerEvents =
            e > 0.65 && handoffP < 0.2 ? 'auto' : 'none';

          for (let i = 0; i < p4Vectors.length; i++) {
            const el = p4CharRefs.current[i];
            if (!el) continue;
            const vec = p4Vectors[i];

            const charStagger = i * 0.006;
            const localP = clamp01((p4 - charStagger) / 0.4);
            const gatherE = smoothstep(localP);
            const inv = 1 - gatherE;

            const tx = vec.offsetX * inv * 1.15;
            const ty = vec.offsetY * inv * 1.15;
            const rot = vec.rot * inv;
            const sc = 0.5 + 0.5 * gatherE;

            el.style.willChange = charWillChange;
            el.style.opacity = gatherE.toFixed(3);
            el.style.transform =
              inv > 0.001
                ? `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(
                    1
                  )}px, 0) rotateZ(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`
                : 'translate3d(0,0,0) rotateZ(0deg) scale(1)';
          }

          if (phase4HeadingRef.current) {
            const bl = (1 - e) * 12 + handoffP * 8;
            phase4HeadingRef.current.style.filter =
              bl > 0.15 ? `blur(${bl.toFixed(2)}px)` : 'none';
          }

          if (p4PinwheelRef.current) {
            const pwScale = easeOutBack(clamp01((p4 - 0.18) / 0.3), 2.2);
            p4PinwheelRef.current.style.transform = `scale(${pwScale.toFixed(
              3
            )})`;
          }

          if (p4CoilRef.current) {
            const coilScale = easeOutBack(clamp01((p4 - 0.22) / 0.3), 1.9);
            p4CoilRef.current.style.transform = `scale(${coilScale.toFixed(
              3
            )})`;
          }

          if (p4CtaRowRef.current) {
            const ctaP = clamp01((p4 - 0.32) / 0.25);
            const ctaEase = easeOutBack(ctaP, 1.65);
            const ctaY = (1 - ctaEase) * 32;
            const ctaScale = 0.85 + 0.15 * ctaEase;
            p4CtaRowRef.current.style.opacity = (
              clamp01(ctaP * 1.8) *
              (1 - handoffP)
            ).toFixed(3);
            p4CtaRowRef.current.style.transform = `translate3d(0, ${ctaY.toFixed(
              1
            )}px, 0) scale(${ctaScale.toFixed(3)})`;
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // SEAMLESS DIRECT HANDOFF (0.54 – 0.59): Meadow -> Single Looping Room Video
      // ─────────────────────────────────────────────────────────────────────
      if (meadowWrapperRef.current) {
        if (s <= 0.54) {
          meadowWrapperRef.current.style.visibility = 'visible';
          meadowWrapperRef.current.style.opacity = '1';
          meadowWrapperRef.current.style.transform = 'scale(1)';
          meadowWrapperRef.current.style.borderRadius = '0px';
          if (nightPausedRef.current) {
            nightPausedRef.current = false;
          }
        } else {
          const meadowScale = 1 - handoffP * 0.12; // 1.0 -> 0.88
          const meadowOp = 1 - handoffP; // 1.0 -> 0.0
          const meadowRadius = handoffP * 28;

          meadowWrapperRef.current.style.visibility =
            meadowOp <= 0.005 ? 'hidden' : 'visible';
          meadowWrapperRef.current.style.opacity = meadowOp.toFixed(3);
          meadowWrapperRef.current.style.transform = `scale(${meadowScale.toFixed(
            4
          )})`;
          meadowWrapperRef.current.style.borderRadius = `${meadowRadius.toFixed(
            1
          )}px`;

          const shouldPauseNight = s >= 0.59;
          if (shouldPauseNight !== nightPausedRef.current) {
            nightPausedRef.current = shouldPauseNight;
            if (shouldPauseNight && nightVideoRef.current) {
              nightVideoRef.current.pause();
            }
          }
        }
      }

      // Stage 6 normalized progress (0.00 -> 1.00 across s: 0.78 -> 1.00)
      const p6 = clamp01((s - 0.78) / 0.22);
      stage6ProgressRef.current = p6;

      if (roomVideoRef.current) {
        if (s < 0.53 || p6 >= 0.5) {
          roomVideoRef.current.style.opacity = '0';
          roomVideoRef.current.style.visibility = 'hidden';
          if (roomPlayingRef.current) {
            roomPlayingRef.current = false;
            roomVideoRef.current.pause();
          }
        } else {
          const roomOp = handoffP; // 0 -> 1 across 0.54 -> 0.59
          const roomScale = 1.04 - handoffP * 0.04; // 1.04 -> 1.0
          roomVideoRef.current.style.visibility = 'visible';
          roomVideoRef.current.style.opacity = roomOp.toFixed(3);
          roomVideoRef.current.style.transform = `scale(${roomScale.toFixed(
            4
          )})`;

          if (!roomPlayingRef.current) {
            roomPlayingRef.current = true;
            roomVideoRef.current.play().catch(() => {});
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // STAGE 5 & STAGE 6A/6B: Transparent Three.js GLSL Work Ribbon -> 3D CRT Monitor Zoom
      // ─────────────────────────────────────────────────────────────────────
      if (stage5LayerRef.current) {
        if (s < 0.56 || p6 >= 0.52) {
          stage5LayerRef.current.style.opacity = '0';
          stage5LayerRef.current.style.visibility = 'hidden';
          stage5LayerRef.current.style.pointerEvents = 'none';
          for (let i = 0; i < s5Vectors.length; i++) {
            const el = s5CharRefs.current[i];
            if (el && el.style.willChange !== 'auto') {
              el.style.willChange = 'auto';
            }
          }
        } else {
          stage5LayerRef.current.style.visibility = 'visible';
          const stage5Enter = smoothstep(clamp01((s - 0.56) / 0.05));
          stage5LayerRef.current.style.opacity = stage5Enter.toFixed(3);
          stage5LayerRef.current.style.pointerEvents =
            stage5Enter > 0.35 && p6 < 0.15 ? 'auto' : 'none';

          // Subtle Top-Center Header ("05 // SELECTED WORKS" + "Crafted in motion.")
          // Fades out as the ribbon twists or as Stage 6 CRT monitor emerges
          const headerP = clamp01((s - 0.57) / 0.06);
          const isHeaderGathering = headerP > 0 && headerP < 1;
          const s5CharWillChange = isHeaderGathering
            ? 'transform, opacity'
            : 'auto';

          if (s5HeaderRef.current) {
            const twistFade = 1 - Math.min(0.62, ribbonTwistRef.current * 0.75);
            const crtFade = 1 - smoothstep(clamp01(p6 / 0.14));
            s5HeaderRef.current.style.opacity = (
              stage5Enter *
              twistFade *
              crtFade
            ).toFixed(3);
          }

          for (let i = 0; i < s5Vectors.length; i++) {
            const el = s5CharRefs.current[i];
            if (!el) continue;
            const vec = s5Vectors[i];

            const stagger = i * 0.012;
            const localP = clamp01((headerP - stagger) / 0.68);
            const easeP = smoothstep(localP);
            const inv = 1 - easeP;

            const tx = vec.offsetX * inv * 0.9;
            const ty = vec.offsetY * inv * 0.9;
            const tz = 60 * inv;
            const rot = vec.rot * inv;

            el.style.willChange = s5CharWillChange;
            el.style.opacity = easeP.toFixed(3);
            el.style.transform =
              inv > 0.001
                ? `perspective(600px) translate3d(${tx.toFixed(
                    1
                  )}px, ${ty.toFixed(1)}px, ${tz.toFixed(
                    1
                  )}px) rotateZ(${rot.toFixed(1)}deg)`
                : 'translate3d(0, 0, 0)';
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // VERTICAL 4-STAGE EDGE PROGRESS RAIL & NAVBAR SYNC
      // ─────────────────────────────────────────────────────────────────────
      if (railRef.current) {
        const railIn = clamp01((s - 0.07) / 0.03);
        const railOut = 1 - clamp01((s - 0.54) / 0.04);
        const railOp = railIn * railOut;
        railRef.current.style.opacity = railOp.toFixed(3);
        railRef.current.style.pointerEvents = railOp > 0.5 ? 'auto' : 'none';
      }
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleY(${scrubProgress.toFixed(
          4
        )})`;
      }

      let currentNavKey: NavSectionKey | null = null;
      let stageIdx = 0;
      if (s >= 0.08 && s < 0.2) {
        currentNavKey = 'Services';
        stageIdx = 1;
      } else if (s >= 0.2 && s < 0.34) {
        currentNavKey = 'Works';
        stageIdx = 2;
      } else if (s >= 0.34 && s < 0.45) {
        currentNavKey = 'AI Solutions';
        stageIdx = 3;
      } else if (s >= 0.45 && s < 0.56) {
        currentNavKey = 'Philosophy';
        stageIdx = 4;
      } else if (s >= 0.56) {
        currentNavKey = 'Works';
        stageIdx = 4;
      }

      setActiveStageIdx((prev) => (prev !== stageIdx ? stageIdx : prev));

      const isNight = s >= 0.06;
      if (
        currentNavKey !== lastPhaseRef.current ||
        isNight !== lastNightRef.current
      ) {
        lastPhaseRef.current = currentNavKey;
        lastNightRef.current = isNight;
        onPhaseChange(currentNavKey, isNight);
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [
    onPhaseChange,
    s0Vectors,
    p1Vectors,
    p2Vectors,
    p3Vectors,
    p4Vectors,
    s5Vectors,
  ]);

  const scrollToRatio = (ratio: number) => {
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    window.scrollTo({
      top: ratio * maxScroll,
      behavior: 'smooth',
    });
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
    target.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(
      1
    )}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translate3d(0, 0, 0)';
  };

  const l1Count = S0_LINE1.length;
  const l2Count = S0_LINE2.replace(/ /g, '').length;
  const l3PrefixCount = S0_LINE3_PREFIX.length;

  const p1Part1Count = P1_PART1.replace(/ /g, '').length;
  const p2Part1Count = P2_PART1.replace(/ /g, '').length;
  const p2Pill1Count = P2_PILL1.length;

  const p3Part1Count = P3_PART1.replace(/ /g, '').length;
  const p3Part2Count = P3_PART2.length;

  const p4Part1Count = P4_PART1.replace(/ /g, '').length;
  const s5Part1Count = S5_PART1.replace(/ /g, '').length;

  return (
    <section
      id="hero"
      ref={trackRef}
      className="h-[1150dvh] w-full relative select-none bg-[#05070e]"
    >
      {/* Single Unified Sticky Viewport Stage (Zero Vertical Seam Across All Stages 0–6) */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-[#05070e]">
        {/* Layer 0 (z-0): Single Looping Room Video for Stage 5 (0.68 -> 1.00) */}
        <video
          ref={roomVideoRef}
          src="/assets/aistudio/Our_Projects_c6b78b5e.mp4"
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{opacity: 0, visibility: 'hidden'}}
          className="z-0 absolute inset-0 object-cover w-full h-full pointer-events-none"
        />

        {/* Subtle Room Vignette for Editorial Readability while Preserving Warm Lamp & Wood Refraction */}
        <div
          aria-hidden="true"
          className="z-[1] absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(5,7,14,0.18)_0%,rgba(5,7,14,0.58)_100%)] pointer-events-none"
        />

        {/* Layer 1 (z-10): Stages 0–4 Daytime & Nighttime Meadow Wrapper (Scales 1 -> 0.88 & Fades Out in 0.68–0.75) */}
        <div
          ref={meadowWrapperRef}
          className="z-10 relative w-full h-full overflow-hidden origin-center"
        >
          {/* Hidden Preload Video for Initial First-Frame Fallback */}
          <video
            ref={nightVideoRef}
            src="/assets/aistudio/Scroll_Animation_b9c5da2e.mp4"
            playsInline
            muted
            preload="auto"
            aria-hidden="true"
            className="sr-only pointer-events-none"
          />

          {/* Zero-Lag Hardware Canvas Scrubbing Renderer */}
          <canvas
            ref={canvasRef}
            aria-label="Nighttime scrollytelling journey zooming into the vintage computer, developer room, AI code warp, and night meadow"
            className="z-0 absolute inset-0 w-full h-full block pointer-events-none"
          />

          {/* Subtle Nighttime Contrast Vignette */}
          <div
            aria-hidden="true"
            className="z-0 absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none"
          />

          {/* Stage 0 Daytime Hero Video + Kinetic Character Assembly */}
          <div
            ref={dayLayerRef}
            style={{opacity: 1}}
            className="z-10 absolute inset-0 w-full h-full flex items-center"
          >
            <video
              ref={dayVideoRef}
              src="/assets/aistudio/Hero_section_video_1dbbb207.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Daytime vintage computer with a bright blue screen resting in a sunlit green meadow"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#0f1f14]/42 via-[#0f1f14]/14 to-transparent pointer-events-none"
            />

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 md:px-14 pt-16">
              <div className="max-w-[660px] flex flex-col items-start text-left">
                <div
                  aria-label={HERO_EYEBROW_TEXT}
                  className="font-mono text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-[#e8f2e6]/95 drop-shadow-[0_1px_6px_rgba(12,26,16,0.45)] mb-4"
                >
                  <span ref={s0EyebrowRef} aria-hidden="true">
                    {HERO_EYEBROW_TEXT}
                  </span>
                </div>

                <h1
                  aria-label={S0_FULL_TEXT}
                  className="flex flex-col items-start text-[#fbfdf9] drop-shadow-[0_2px_18px_rgba(12,26,16,0.38)]"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex flex-wrap items-center gap-2.5 font-sans font-medium tracking-[-0.035em] text-[clamp(2.35rem,4.6vw,4.2rem)] leading-[1.08]"
                  >
                    <SplitWords
                      text={S0_LINE1}
                      charRefs={s0CharRefs}
                      startIndex={0}
                      overflowMask={true}
                      pinwheelOnFirstI={true}
                      pinwheelRef={s0PinwheelRef}
                    />
                    <SpringCoilGlyph
                      ref={s0CoilRef}
                      className="w-6 h-8 sm:w-7 sm:h-9 -mt-1"
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className="inline-flex items-start font-sans font-medium tracking-[-0.035em] text-[clamp(2.35rem,4.6vw,4.2rem)] leading-[1.06]"
                  >
                    <SplitWords
                      text={S0_LINE2}
                      charRefs={s0CharRefs}
                      startIndex={l1Count}
                    />
                    <AsteriskGlyph
                      ref={s0AsteriskRef}
                      className="w-5 h-5 sm:w-6 sm:h-6 ml-1.5 -mt-1"
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-flex flex-wrap items-center gap-2.5 font-serif italic font-medium tracking-[-0.02em] text-[#eef7ff] text-[clamp(2.65rem,5.3vw,4.85rem)] leading-[1.02]"
                  >
                    <SplitWords
                      text={S0_LINE3_PREFIX}
                      charRefs={s0CharRefs}
                      startIndex={l1Count + l2Count}
                      overflowMask={true}
                    />
                    <span
                      ref={s0PillRef}
                      className="rounded-2xl bg-gradient-to-r from-[#00d2ff]/25 via-emerald-400/20 to-indigo-500/25 border border-white/25 backdrop-blur-md px-4 py-1 inline-flex items-center gap-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
                    >
                      <SplitWords
                        text={S0_LINE3_PILL}
                        charRefs={s0CharRefs}
                        startIndex={l1Count + l2Count + l3PrefixCount}
                        overflowMask={true}
                      />
                      <BezierSplineBadge
                        ref={s0BezierPathRef}
                        className="w-14 h-7 sm:w-16 sm:h-8 shrink-0"
                      />
                    </span>
                  </span>
                </h1>

                <p className="mt-5 font-sans text-sm sm:text-base md:text-[16.5px] font-normal text-[#f2f7f0]/95 leading-[1.65] max-w-[48ch] drop-shadow-[0_1px_10px_rgba(12,26,16,0.42)]">
                  Vixa builds high-performance digital ecosystems. From immersive
                  UI/UX web development to custom AI integrations, we scale your
                  business with intelligent solutions.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    onClick={() => onOpenBooking('Full-Stack Ecosystem')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#f6faf7] active:scale-[0.98] text-[#15241b] text-xs sm:text-[13.5px] font-semibold shadow-[0_10px_28px_-6px_rgba(12,26,16,0.3)] transition-transform duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Initiate Project</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.25] text-[#15241b]" />
                  </button>

                  <LiquidGlassSurface
                    as="button"
                    variant="pill"
                    tint="meadow-pill"
                    roundedClass="rounded-full"
                    onClick={() => scrollToRatio(0.62)}
                    className="px-6 py-3.5 text-white text-xs sm:text-[13.5px] font-medium whitespace-nowrap shrink-0"
                  >
                    <span className="inline-flex items-center gap-2.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.32)]">
                      <Play className="w-3.5 h-3.5 text-white fill-white stroke-[2]" />
                      <span>Explore Flagship Works</span>
                    </span>
                  </LiquidGlassSurface>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollToRatio(0.13)}
              aria-label="Scroll down to start the storytelling journey"
              className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-sans font-medium tracking-[0.18em] uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                Scroll to Dive In
              </span>
              <ChevronDown className="w-4 h-4 animate-bounce drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            OVERLAYS LAYER (z-20): Phases 1–4 Scene-Choreographed Kinetic Stages
           ─────────────────────────────────────────────────────────────────── */}
        <div className="z-20 absolute inset-0 pointer-events-none">
          {/* PHASE 1: The Night Meadow & CRT Portal (0.10 – 0.24 Scroll) */}
          <div
            ref={phase1Ref}
            style={{opacity: 0, visibility: 'hidden'}}
            className="fixed left-6 sm:left-10 md:left-20 top-[28%] sm:top-[30%] max-w-xl text-left"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-12 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(4,9,18,0.72)_0%,rgba(4,9,18,0.32)_54%,transparent_78%)] pointer-events-none"
            />
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#38bdf8] mb-3 drop-shadow-[0_2px_10px_rgba(0,210,255,0.35)]">
              01 // BEYOND THE SURFACE
            </div>

            <h2
              aria-label={P1_FULL_TEXT}
              className="text-3xl sm:text-5xl md:text-[3.5rem] font-sans font-medium tracking-[-0.03em] text-white leading-[1.08] mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)]"
            >
              <SplitWords
                text={P1_PART1}
                charRefs={p1CharRefs}
                startIndex={0}
                overflowMask={true}
              />{' '}
              <span
                aria-hidden="true"
                className="relative inline-flex flex-wrap items-center gap-2.5 align-bottom mt-1"
              >
                <span
                  ref={p1PillRef}
                  className="origin-left rounded-2xl bg-gradient-to-r from-[#00d2ff]/22 via-emerald-400/20 to-[#38bdf8]/25 border border-[#38bdf8]/45 backdrop-blur-md px-3.5 py-0.5 inline-flex items-center gap-2.5 shadow-[0_8px_28px_rgba(0,210,255,0.2)]"
                >
                  <SplitWords
                    text={P1_PART2}
                    charRefs={p1CharRefs}
                    startIndex={p1Part1Count}
                    overflowMask={true}
                    className="font-serif italic font-normal text-[#e0f2fe] text-[1.08em]"
                  />
                  <span ref={p1BezierWrapRef} className="inline-flex">
                    <BezierSplineBadge
                      ref={p1BezierPathRef}
                      className="w-13 h-7 sm:w-15 sm:h-8"
                    />
                  </span>
                </span>
              </span>
            </h2>

            <p className="font-sans text-sm sm:text-base md:text-lg text-slate-200/90 leading-relaxed max-w-lg drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              A sunlit interface is only the first impression. We step through
              the glass to engineer the high-performance systems powering your
              digital ecosystem.
            </p>
          </div>

          {/* PHASE 2: Inside the Engineering Studio (0.25 – 0.42 Scroll) */}
          <div
            ref={phase2DockRef}
            style={{opacity: 0, visibility: 'hidden'}}
            className="fixed inset-x-0 bottom-5 sm:bottom-7 mx-auto w-[94%] max-w-3xl text-center backdrop-blur-xl bg-[#050912]/72 border border-white/15 rounded-3xl px-5 sm:px-8 py-4 sm:py-5 shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-sky-300/90 mb-2">
              <span>02 // HUMAN INGENUITY × SYSTEM LOGIC</span>
              <AsteriskGlyph ref={p2AsteriskRef} className="w-4 h-4" />
            </div>

            <h2
              aria-label={P2_FULL_TEXT}
              className="text-2xl sm:text-4xl md:text-[2.75rem] font-sans font-medium tracking-[-0.03em] text-white leading-[1.12] mb-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5"
            >
              <SplitWords
                text={P2_PART1}
                charRefs={p2CharRefs}
                startIndex={0}
              />

              <span
                ref={p2ObsessivePillRef}
                aria-hidden="true"
                className="inline-block rounded-xl bg-[#ff7a59] text-slate-950 font-sans font-semibold px-3.5 py-0.5 shadow-[0_6px_22px_rgba(255,122,89,0.4)]"
              >
                <SplitWords
                  text={P2_PILL1}
                  charRefs={p2CharRefs}
                  startIndex={p2Part1Count}
                />
              </span>

              <span
                ref={p2MindsPillRef}
                aria-hidden="true"
                className="inline-block rounded-xl bg-[#00e5a3] text-slate-950 font-serif italic font-semibold px-3.5 py-0.5 text-[1.06em] shadow-[0_6px_22px_rgba(0,229,163,0.4)]"
              >
                <SplitWords
                  text={P2_PILL2}
                  charRefs={p2CharRefs}
                  startIndex={p2Part1Count + p2Pill1Count}
                />
              </span>
            </h2>

            <p className="font-sans text-xs sm:text-sm md:text-[15px] text-slate-200/90 leading-relaxed max-w-2xl mx-auto">
              <span ref={p2LeftBodyRef} className="inline-block">
                UI/UX architects and systems engineers working in lockstep—
              </span>{' '}
              <span ref={p2RightBodyRef} className="inline-block">
                crafting resilient, custom codebases designed around how your
                business actually operates.
              </span>
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              <div className="bg-black/45 border border-[#ff7a59]/45 rounded-full px-3.5 py-1 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[#ff7a59] shadow-[0_0_8px_#ff7a59]"
                />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-amber-100/95">
                  UI/UX &amp; Product Strategy
                </span>
              </div>

              <div className="bg-black/45 border border-[#00e5a3]/45 rounded-full px-3.5 py-1 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full bg-[#00e5a3] shadow-[0_0_8px_#00e5a3]"
                />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-emerald-100/95">
                  Full-Stack &amp; Custom Systems
                </span>
              </div>
            </div>
          </div>

          {/* PHASE 3: The Code IDE & Lightspeed AI Warp (0.43 – 0.56 Scroll) */}
          <div
            ref={phase3Ref}
            style={{opacity: 0, visibility: 'hidden'}}
            className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(circle_at_center,rgba(5,10,20,0.68)_0%,transparent_65%)]"
          >
            <div className="border border-[#00d2ff]/45 bg-[#00d2ff]/12 text-[#7ce8ff] rounded-full px-4 py-1 font-mono text-xs tracking-[0.2em] uppercase mb-4 shadow-[0_0_25px_rgba(0,210,255,0.35)]">
              03 // NEURAL ACCELERATION
            </div>

            <h2
              aria-label={P3_FULL_TEXT}
              className="text-3xl sm:text-5xl md:text-6xl font-sans font-medium tracking-tight text-white leading-[1.08] mb-4 drop-shadow-[0_0_35px_rgba(0,210,255,0.5)] max-w-3xl flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2"
            >
              <SplitWords
                text={P3_PART1}
                charRefs={p3CharRefs}
                startIndex={0}
              />
              <LightningGlyph
                ref={p3BoltRef}
                className="w-7 h-9 sm:w-9 sm:h-11 -mx-0.5 drop-shadow-[0_0_16px_rgba(0,245,160,0.75)]"
              />
              <SplitWords
                text={P3_PART2}
                charRefs={p3CharRefs}
                startIndex={p3Part1Count}
                className="font-serif italic font-normal text-[#7ce8ff] text-[1.08em]"
              />
              <span
                ref={p3PillRef}
                aria-hidden="true"
                className="inline-block border border-[#00d2ff]/60 bg-[#00d2ff]/15 backdrop-blur-md rounded-2xl px-4 py-0.5 font-serif italic font-normal text-[#e0f9ff] text-[1.08em] shadow-[0_0_30px_rgba(0,210,255,0.35)]"
              >
                <SplitWords
                  text={P3_PILL}
                  charRefs={p3CharRefs}
                  startIndex={p3Part1Count + p3Part2Count}
                />
              </span>
            </h2>

            <p className="font-sans text-sm sm:text-base md:text-lg max-w-lg text-slate-200/90 leading-relaxed drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]">
              We embed custom AI agents, automated pipelines, and real-time
              intelligence directly into your stack—turning complex workflows
              into instant execution.
            </p>
          </div>

          {/* PHASE 4: The Open Night Meadow Finale (0.57 – 0.68 Scroll) */}
          <div
            ref={phase4Ref}
            style={{opacity: 0, visibility: 'hidden'}}
            className="fixed inset-0 flex flex-col items-center justify-center -translate-y-6 text-center px-6"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_42%,rgba(4,8,16,0.58)_0%,transparent_64%)] pointer-events-none"
            />
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sky-300/90 mb-3">
              04 // BOUNDLESS SCALE
            </div>

            <h2
              ref={phase4HeadingRef}
              aria-label={P4_FULL_TEXT}
              className="text-4xl sm:text-6xl md:text-7xl font-sans font-light tracking-tight text-white leading-[1.06] mb-4 drop-shadow-[0_4px_28px_rgba(0,0,0,0.75)] flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
            >
              <SplitWords
                text={P4_PART1}
                charRefs={p4CharRefs}
                startIndex={0}
              />
              <span
                ref={p4PillRef}
                aria-hidden="true"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-white/[0.08] border border-white/25 backdrop-blur-md px-4 py-0.5 font-serif italic font-normal text-[#e0f2fe] text-[1.06em] shadow-[0_12px_36px_rgba(0,0,0,0.45)]"
              >
                <SplitWords
                  text={P4_PILL}
                  charRefs={p4CharRefs}
                  startIndex={p4Part1Count}
                  pinwheelOnFirstI={true}
                  pinwheelRef={p4PinwheelRef}
                />
                <SpringCoilGlyph
                  ref={p4CoilRef}
                  className="w-5 h-7 sm:w-6 sm:h-8"
                />
              </span>
            </h2>

            <p className="font-sans max-w-xl text-white/85 text-base md:text-lg leading-relaxed mb-8 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
              A future-proof digital presence engineered to evolve, scale, and
              lead. Ready to build what comes next?
            </p>

            <div
              ref={p4CtaRowRef}
              className="pointer-events-auto flex flex-wrap items-center justify-center gap-4"
            >
              <button
                type="button"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                onClick={() => onOpenBooking('Full-Stack Ecosystem')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#f6faf7] active:scale-[0.98] text-[#15241b] text-xs sm:text-sm font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-transform duration-150 whitespace-nowrap cursor-pointer"
              >
                <span>Initiate Project</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.25] text-[#15241b]" />
              </button>

              <div
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="transition-transform duration-150"
              >
                <LiquidGlassSurface
                  as="button"
                  variant="pill"
                  tint="meadow-pill"
                  roundedClass="rounded-full"
                  onClick={() => scrollToRatio(0.62)}
                  className="px-7 py-3.5 text-white text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                    <span>Explore Our Work</span>
                  </span>
                </LiquidGlassSurface>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            STAGE 5 & 6A/6B LAYER (z-20): Transparent Three.js GLSL "Work Ribbon"
            & 3D Retro CRT Monitor Zoom-In over the single looping room video
           ─────────────────────────────────────────────────────────────────── */}
        <div
          ref={stage5LayerRef}
          style={{opacity: 0, visibility: 'hidden', pointerEvents: 'none'}}
          className="z-20 absolute inset-0"
        >
          {/* 100% Transparent WebGL 3D Work Ribbon & CRT Monitor Canvas */}
          <WorkRibbonCanvas
            scrollProgressRef={smoothScrollRef}
            stage6ProgressRef={stage6ProgressRef}
            onSelectProject={setSelectedProject}
            headerTwistRef={ribbonTwistRef}
          />

          {/* Subtle Floating Top-Center Section Header (top-24) */}
          <div
            ref={s5HeaderRef}
            className="absolute top-24 inset-x-0 px-6 flex flex-col items-center text-center pointer-events-none transition-opacity duration-150"
          >
            <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#38bdf8] mb-1.5 drop-shadow-[0_2px_10px_rgba(0,210,255,0.35)]">
              {S5_EYEBROW}
            </div>

            <h2
              aria-label={S5_FULL_HEADLINE}
              className="text-2xl sm:text-4xl md:text-[2.75rem] font-sans font-medium tracking-[-0.03em] text-white text-center leading-[1.08] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
            >
              <SplitWords
                text={S5_PART1}
                charRefs={s5CharRefs}
                startIndex={0}
              />
              <SplitWords
                text={S5_PILL}
                charRefs={s5CharRefs}
                startIndex={s5Part1Count}
                className="font-serif italic font-normal text-[#e0f2fe] text-[1.08em]"
              />
            </h2>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            STAGE 6 LAYER (z-30): Full-Screen Fisheye Static CRT FAQ Terminal
           ─────────────────────────────────────────────────────────────────── */}
        <CrtFaqSection stage6ProgressRef={stage6ProgressRef} />

        {/* Minimal 4-Stage Vertical Progress Indicator on the Far Right Edge (Phases 1–4) */}
        <div
          ref={railRef}
          style={{opacity: 0, pointerEvents: 'none'}}
          aria-label="Scrollytelling Stage Progress"
          className="hidden sm:flex fixed right-5 md:right-8 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3 transition-opacity duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-3.5">
              {STAGE_ANCHORS.map((stage, idx) => {
                const isCurrent = activeStageIdx === idx + 1;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => scrollToRatio(stage.scrollTarget)}
                    className={`group flex items-center gap-2 text-right transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] tracking-[0.18em] uppercase transition-opacity duration-200 ${
                        isCurrent
                          ? 'opacity-100 text-[#7ce8ff]'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.15em]">
                      {stage.id}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-[1.5px] h-28 bg-white/15 rounded-full overflow-hidden">
              <div
                ref={railFillRef}
                style={{transform: 'scaleY(0)'}}
                className="absolute inset-0 bg-[#00d2ff] origin-top shadow-[0_0_8px_#00d2ff]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Crystal-Glass Project Detail Card Modal (On Flagship Card Click) */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onInitiateSimilar={(track) => onOpenBooking(track)}
      />

      {/* Interactive Crystal-Glass Workreel Modal */}
      {workreelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workreel-title"
          onClick={() => setWorkreelOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <LiquidGlassSurface
              variant="card"
              tint="card-glass"
              roundedClass="rounded-[28px]"
              className="p-5 sm:p-7 text-white w-full"
            >
              <div className="w-full drop-shadow-[0_1px_6px_rgba(10,24,14,0.45)]">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#7ce8ff]">
                      VIXA 2026 SHOWREEL · WEB, UI/UX &amp; AI
                    </div>
                    <h2
                      id="workreel-title"
                      className="font-sans text-lg sm:text-xl font-bold text-white mt-0.5"
                    >
                      Selected Architecture &amp; Case Studies
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkreelOpen(false)}
                    aria-label="Close workreel modal"
                    className="p-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/50 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/40 shadow-inner bg-black">
                  <video
                    src="/assets/aistudio/Scroll_Animation_b9c5da2e.mp4"
                    autoPlay
                    loop
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </LiquidGlassSurface>
          </div>
        </div>
      )}
    </section>
  );
}
