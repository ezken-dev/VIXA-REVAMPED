'use client';

import React, {useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {X, ArrowUpRight} from 'lucide-react';
import {LiquidGlassSurface} from './LiquidGlass';

export interface FlagshipHighlight {
  title: string;
  detail: string;
}

export interface FlagshipProject {
  id: string;
  index: string;
  caption: string;
  categoryBadge: string;
  title: string;
  serifSubtitle: string;
  shortDescription: string;
  overview: string;
  videoPath: string;
  posterId: string;
  aspect: number;
  highlights: [FlagshipHighlight, FlagshipHighlight, FlagshipHighlight];
  capabilities: [string, string, string];
  techStack: string[];
  bookingTrack: string;
}

export const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: 'ni-group',
    index: '01 / 08',
    caption: 'N&I Group — Intelligent Enterprise',
    categoryBadge: 'Web Architecture & Custom AI',
    title: 'N&I Group',
    serifSubtitle: 'Intelligent Enterprise',
    shortDescription:
      'Custom AI chatbot concierge and high-availability server architecture engineered for enterprise scale.',
    overview:
      'N&I Group required a full-scale corporate platform remaster capable of guiding enterprise clients in real time while maintaining fault-tolerant global performance. Vixa architected a bespoke AI concierge paired with a multi-region server infrastructure designed for zero-downtime resilience.',
    videoPath: 'aaaf/living-portrait-hero',
    posterId: 'hf_20261031_044539_b7fde132-8c25-4dda-ab05-4e4be99bf3d3',
    aspect: 1.745,
    highlights: [
      {
        title: 'Custom AI Concierge',
        detail:
          'Domain-trained conversational agent delivering instant enterprise routing and synthesis.',
      },
      {
        title: '99.99% Uptime Architecture',
        detail:
          'High-availability server cluster with edge caching and zero-downtime releases.',
      },
      {
        title: 'Full Platform Remaster',
        detail:
          'End-to-end editorial UI system engineered for executive clarity and conversion.',
      },
    ],
    capabilities: ['Next.js Architecture', 'Custom AI Concierge', 'High-Availability'],
    techStack: [
      'Next.js 15',
      'TypeScript',
      'Custom LLM Concierge',
      'Edge Caching',
      'Distributed Server Cluster',
    ],
    bookingTrack: 'Autonomous AI Agents',
  },
  {
    id: 'higher-purpose',
    index: '02 / 08',
    caption: 'Higher Purpose Foundation',
    categoryBadge: 'Immersive UI/UX & Brand System',
    title: 'Higher Purpose Foundation',
    serifSubtitle: 'Digital Ecosystem',
    shortDescription:
      'Accessible humanitarian web platform and cohesive brand system built for global donor impact.',
    overview:
      'Higher Purpose Foundation needed a digital presence that translated complex global initiatives into an emotionally resonant, effortless donor journey. Vixa crafted a WCAG AAA accessible design system with fluid storytelling motion and frictionless contribution flows.',
    videoPath: 'aaaf/mossline-hero',
    posterId: 'hf_20261106_032528_99eb9a00-a553-40b6-8b97-017e918971c6',
    aspect: 1.7,
    highlights: [
      {
        title: 'WCAG AAA Accessible UI',
        detail:
          'High-contrast typographic hierarchy and inclusive navigation across all devices.',
      },
      {
        title: 'Interactive Storytelling',
        detail:
          'Choreographed visual narratives showcasing real-world humanitarian outcomes.',
      },
      {
        title: 'Donor Conversion Engine',
        detail:
          'Streamlined recurring contribution architecture that lifted donor retention.',
      },
    ],
    capabilities: ['UI/UX Architecture', 'Brand Identity', 'Interactive Motion'],
    techStack: [
      'Next.js',
      'Tailwind CSS',
      'Motion Physics',
      'WCAG AAA Design System',
      'Headless CMS',
    ],
    bookingTrack: 'Design Systems & UI/UX',
  },
  {
    id: 'duofinance',
    index: '03 / 08',
    caption: 'DuoFinance — Shared Intelligence',
    categoryBadge: 'Fintech Web Application',
    title: 'DuoFinance',
    serifSubtitle: 'Shared Intelligence',
    shortDescription:
      'Partner finance tracking application with real-time sync, smart split ledgers, and tactile dark-mode clarity.',
    overview:
      'DuoFinance reimagines how couples and household partners manage shared wealth and recurring expenses. Vixa engineered a sub-second synchronized financial web application featuring proportional income splits, automated forecasting, and an obsidian glass interface.',
    videoPath: 'aaaf/fernhollow',
    posterId: 'hf_20261103_061637_11907771-15ce-494b-81a4-9051861d6ce5',
    aspect: 1.735,
    highlights: [
      {
        title: 'Real-Time Partner Sync',
        detail:
          'Optimistic state synchronization keeping both partners aligned in under 50ms.',
      },
      {
        title: 'Smart Split Ledger',
        detail:
          'Automated proportional and custom expense rules with instant settlement.',
      },
      {
        title: 'Obsidian Financial UI',
        detail:
          'Calm, high-clarity dark-mode visual hierarchy for effortless cashflow review.',
      },
    ],
    capabilities: ['Full-Stack Web App', 'Real-Time Sync', 'Financial UI'],
    techStack: [
      'React 19',
      'TypeScript',
      'Real-Time WebSockets',
      'Encrypted Ledger',
      'Tailwind CSS',
    ],
    bookingTrack: 'Full-Stack Ecosystem',
  },
  {
    id: 'liora',
    index: '04 / 08',
    caption: 'Liora — Coquette Apparel System',
    categoryBadge: 'Luxury E-Commerce & Editorial UI',
    title: 'Liora',
    serifSubtitle: 'Coquette Apparel System',
    shortDescription:
      'Bespoke fashion lookbook and high-conversion commerce platform with fluid editorial transitions.',
    overview:
      'Liora sought a tactile digital flagship that felt like flipping through an atelier lookbook while maintaining sub-second checkout speed. Vixa engineered a custom headless commerce architecture with choreographed motion, dynamic sizing intelligence, and zero-layout-shift media delivery.',
    videoPath: 'aaaf/vell-lookbook',
    posterId: 'hf_20261102_044911_1ad79156-a8dc-475a-8891-8408a9b61d20',
    aspect: 1.837,
    highlights: [
      {
        title: 'Editorial Lookbook Engine',
        detail:
          'Seamless 60fps media transitions blending high-fashion storytelling with instant shoppability.',
      },
      {
        title: 'AI Fit & Sizing Advisor',
        detail:
          'Personalized garment measurements and drape recommendations reducing return rates.',
      },
      {
        title: 'Sub-Second Edge Checkout',
        detail:
          'Global edge-cached storefront and optimistic cart state engineered for peak drop traffic.',
      },
    ],
    capabilities: ['Headless Commerce', 'Editorial Motion', 'AI Sizing'],
    techStack: [
      'Next.js App Router',
      'TypeScript',
      'WebGL Lookbook',
      'Edge Storefront API',
      'Tailwind CSS',
    ],
    bookingTrack: 'Design Systems & UI/UX',
  },
  {
    id: 'club-ez',
    index: '05 / 08',
    caption: 'Club EZ — AI Discord Architecture',
    categoryBadge: 'AI & Community Automation',
    title: 'Club EZ',
    serifSubtitle: 'AI Discord Architecture',
    shortDescription:
      'Custom moderation and leveling AI bot engineered with Node.js and high-throughput SQLite persistence.',
    overview:
      'Club EZ needed an autonomous governance and engagement engine capable of moderating thousands of concurrent community messages while rewarding active members. Vixa built a low-latency Node.js and WAL-mode SQLite architecture powered by context-aware Gemini AI moderation.',
    videoPath: 'aaaf/vasari-vhs-hero',
    posterId: 'hf_20261029_012401_8f947ed0-7b82-47d6-bdcd-b1ce1af0bf5f',
    aspect: 1.526,
    highlights: [
      {
        title: 'Gemini AI Auto-Moderation',
        detail:
          'Context-aware safety filter that quarantines spam and toxicity in milliseconds.',
      },
      {
        title: 'Node.js + SQLite Engine',
        detail:
          'Zero-latency WAL-mode persistence handling over a million daily community events.',
      },
      {
        title: 'Automated XP & Leveling',
        detail:
          'Dynamic progression curves, role unlocks, and real-time community leaderboards.',
      },
    ],
    capabilities: ['Node.js Runtime', 'SQLite Engine', 'AI Moderation'],
    techStack: [
      'Node.js',
      'SQLite WAL',
      'Gemini AI API',
      'Event-Driven Workers',
      'TypeScript',
    ],
    bookingTrack: 'Autonomous AI Agents',
  },
  {
    id: 'search-exam-essentials',
    index: '06 / 08',
    caption: 'Search Exam Essentials',
    categoryBadge: 'EdTech & Semantic Search',
    title: 'Search Exam Essentials',
    serifSubtitle: 'Cognitive Prep Platform',
    shortDescription:
      'Semantic exam preparation engine with instant vector indexing and adaptive spaced-repetition workflows.',
    overview:
      'Search Exam Essentials empowers students and medical professionals to query thousands of complex syllabus topics in milliseconds. Vixa architected a hybrid vector-keyword search engine paired with an adaptive study interface that pinpoints knowledge gaps automatically.',
    videoPath: 'aaaf/lumen-roof-hero',
    posterId: 'hf_20261102_041507_8e9c2d22-8be2-4652-8bbe-1f4556ea463a',
    aspect: 1.658,
    highlights: [
      {
        title: 'Hybrid Semantic Search',
        detail:
          'Sub-20ms vector + lexical retrieval across tens of thousands of verified exam questions.',
      },
      {
        title: 'Adaptive Spaced Repetition',
        detail:
          'Dynamic recall scheduling calibrated to individual response confidence and speed.',
      },
      {
        title: 'Distraction-Free Study HUD',
        detail:
          'Keyboard-first interface designed for deep cognitive focus during marathon prep sessions.',
      },
    ],
    capabilities: ['Semantic Search', 'Adaptive Learning', 'Full-Stack Web'],
    techStack: [
      'Next.js 15',
      'TypeScript',
      'Vector Embeddings',
      'PostgreSQL',
      'Tailwind CSS',
    ],
    bookingTrack: 'Full-Stack Ecosystem',
  },
  {
    id: 'greenstep',
    index: '07 / 08',
    caption: 'GreenStep — Eco Gamification',
    categoryBadge: 'Sustainability & Behavioral App',
    title: 'GreenStep',
    serifSubtitle: 'Eco Gamification',
    shortDescription:
      'Interactive carbon-footprint tracker and community reward ecosystem turning daily habits into measurable impact.',
    overview:
      'GreenStep transforms personal sustainability into an engaging multiplayer experience. Vixa designed and built an interactive web platform with real-time carbon telemetry, verified eco-challenges, and tactile visual rewards that drive long-term behavioral change.',
    videoPath: 'designs/honey-bee-melli-landing',
    posterId: 'hf_20261017_154537_1384fa6d-282d-46e2-8748-a70be1cf681a',
    aspect: 1.33,
    highlights: [
      {
        title: 'Real-Time Carbon Telemetry',
        detail:
          'Instant footprint modeling across transit, energy, and consumption habits.',
      },
      {
        title: 'Gamified Eco-Streaks',
        detail:
          'Interactive milestones, team leaderboards, and verified community impact badges.',
      },
      {
        title: 'Organic Motion System',
        detail:
          'Nature-inspired physics and micro-interactions that celebrate every sustainable action.',
      },
    ],
    capabilities: ['Gamified UX', 'Impact Telemetry', 'Interactive Motion'],
    techStack: [
      'React 19',
      'TypeScript',
      'Motion Physics',
      'Real-Time Analytics',
      'Tailwind CSS',
    ],
    bookingTrack: 'Design Systems & UI/UX',
  },
  {
    id: 'client-tracker-suite',
    index: '08 / 08',
    caption: 'Client Tracker Suite',
    categoryBadge: 'Enterprise Operations & CRM',
    title: 'Client Tracker Suite',
    serifSubtitle: 'Autonomous Operations',
    shortDescription:
      'Unified agency & enterprise client lifecycle command center with automated SLA telemetry and AI briefings.',
    overview:
      'Client Tracker Suite consolidates multi-team deliverables, billing milestones, and client communications into a single high-velocity command center. Vixa engineered a custom full-stack portal with automated executive briefings and real-time pipeline health diagnostics.',
    videoPath: 'aaaf/found-spider',
    posterId: 'hf_20261104_020746_7eebb7cf-e21b-4288-8211-0cb9d0728f48',
    aspect: 1.61,
    highlights: [
      {
        title: 'Automated Executive Briefs',
        detail:
          'AI-synthesized weekly status reports and risk alerts generated directly from task activity.',
      },
      {
        title: 'Real-Time SLA Telemetry',
        detail:
          'Live velocity tracking, milestone forecasting, and multi-workspace role permissions.',
      },
      {
        title: 'Zero-Latency Command Palette',
        detail:
          'Instant keyboard navigation across thousands of client records and deliverables.',
      },
    ],
    capabilities: ['Enterprise CRM', 'AI Workflow Automation', 'RBAC Security'],
    techStack: [
      'Next.js 15',
      'TypeScript',
      'AI Pipeline Synthesis',
      'Real-Time Sync',
      'Tailwind CSS',
    ],
    bookingTrack: 'Full-Stack Ecosystem',
  },
];

interface ProjectDetailModalProps {
  project: FlagshipProject | null;
  onClose: () => void;
  onInitiateSimilar: (bookingTrack: string) => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
  onInitiateSimilar,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.22, ease: 'easeOut'}}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55"
        >
          <motion.div
            initial={{opacity: 0, scale: 0.92, y: 14}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.94, y: 10}}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 28,
            }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-[92vw]"
          >
            <LiquidGlassSurface
              variant="card"
              tint="sky-pill"
              roundedClass="rounded-[32px]"
              className="p-8 md:p-12 border border-white/25 shadow-2xl text-white w-full"
            >
              <div className="w-full flex flex-col gap-6 text-left font-sans">
                {/* Header: Index & Category Pill + Close Crystal Button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-white/60">
                      {project.index}
                    </span>
                    <span className="text-xs font-medium tracking-wide text-white/90 bg-white/10 border border-white/20 rounded-full px-3.5 py-1">
                      {project.categoryBadge}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close project detail modal"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Editorial Title */}
                <div>
                  <h2
                    id="project-detail-title"
                    className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold tracking-tight text-white leading-[1.08]"
                  >
                    {project.title} —{' '}
                    <span className="font-serif italic font-normal text-white/90">
                      {project.serifSubtitle}
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-white/80 font-normal leading-relaxed">
                    {project.overview}
                  </p>
                </div>

                {/* 3 Refractive Glass Highlight Sub-Cards (3-Column Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {project.highlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl bg-white/[0.06] border border-white/20 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)] flex flex-col justify-between"
                    >
                      <div className="text-sm font-semibold text-white mb-1.5">
                        {item.title}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Row */}
                <div className="pt-2">
                  <div className="text-xs font-medium text-white/55 mb-2.5">
                    Architectural Stack &amp; Capabilities
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs text-white/80 bg-white/[0.06] border border-white/15 rounded-full px-3.5 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const track = project.bookingTrack;
                      onClose();
                      onInitiateSimilar(track);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#f6faf8] active:scale-[0.98] text-slate-950 text-xs sm:text-sm font-semibold shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-all cursor-pointer"
                  >
                    <span>Initiate Similar Project</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.25]" />
                  </button>
                </div>
              </div>
            </LiquidGlassSurface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
