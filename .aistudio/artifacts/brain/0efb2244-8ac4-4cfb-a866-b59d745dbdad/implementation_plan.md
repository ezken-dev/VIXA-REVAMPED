# Vixa — Stage 5: The "Glass Realm" Projects Showcase & Meadow-to-Room Video Handoff

An integrated Stage 5 upgrade for **Vixa** that transitions seamlessly from the Phase 4 Night Meadow into a `400dvh` sticky horizontal scroll showcase backed by your uploaded looping room video (`/assets/aistudio/Our_Projects_c6b78b5e.mp4`), featuring 3D scatter-gather kinetic typography, Liquid-Glass 3D carousel project cards (`N&I Group`, `Higher Purpose Foundation`, `DuoFinance`, `Club EZ`), and a fullscreen obsidian **All Projects Archive Modal**—engineered with strict mobile hardware video decoder and `ResizeObserver` scroll-math guardrails.

## Critical Performance Guardrails

> [!IMPORTANT]
> Both hardware and layout guardrails are enforced inside the 60/120fps `requestAnimationFrame` controller and `ResizeObserver` lifecycle:

1. **Guardrail 1 — Mobile Video Decoder Limit (Max 1–2 Active Decoders)**:
   - **Daytime Hero Video (`dayVideoRef` / `dayLayerRef`)**: Once `scrollProgress >= 0.14`, explicitly call `dayVideoRef.current.pause()` and set `dayLayerRef.current.style.visibility = 'hidden'` (and `dayVideoRef.current.style.display = 'none'`) so mobile browsers release its compositor/decoder resources.
   - **Night Meadow Video (`nightVideoRef`)**: When `scrollProgress` enters Stage 5 and the Night Meadow card reaches `opacity: 0`, explicitly call `nightVideoRef.current.pause()` and set `visibility: 'hidden'`.
   - **Looping Room Video (`roomVideoRef` — `/assets/aistudio/Our_Projects_c6b78b5e.mp4`)**: Remains paused at rest while `scrollProgress` is in Stages 0–4; only call `roomVideoRef.current.play()` when Stage 5 becomes active, and pause it immediately if the user scrolls back up into Phase 4.
2. **Guardrail 2 — Precise Horizontal Scroll Math (`ResizeObserver` + Window Resize)**:
   - Dynamically measure `maxScrollX = Math.max(0, sliderTrackRef.current.scrollWidth - window.innerWidth)` inside both a `ResizeObserver` attached to `sliderTrackRef.current` and a window `resize` listener.
   - Map the `400dvh` Stage 5 horizontal swipe progress (`swipeP ∈ [0, 1]`) directly to `scrollX = swipeP * maxScrollX` so Card 04 (`Club EZ`) lands flush and centered at the viewport edge across every screen size without overshooting or clipping.

---

## User Review & Key Specifications

- **1. Seamless Stage Transition & Background Video (Meadow -> Room)**:
  - **Container**: Unified scrollytelling + `400dvh` Stage 5 scroll section (`h-[900dvh]` total or seamlessly linked sticky stage) with a `sticky top-0 h-[100dvh] w-full overflow-hidden` wrapper.
  - **Background Layer**: Places `/assets/aistudio/Our_Projects_c6b78b5e.mp4` at `z-0` (`object-cover w-full h-full opacity-0`, `muted`, `playsInline`, `loop`).
  - **The Handoff**: As the user scrolls past Phase 4 into Stage 5, the Phase 4 Night Meadow video wrapper scales down into a centered rounded card (`scale: 0.75`, `borderRadius: 32px`), then fades out (`opacity: 1 -> 0`) while simultaneously crossfading the looping room video (`roomVideoRef`) to `opacity: 1`.
- **2. Kinetic Typography Entrance (`05 // SELECTED ARCHITECTURE & AI`)**:
  - Centered header positioned above the horizontal project slider space:
    - *Eyebrow:* `05 // SELECTED ARCHITECTURE & AI` (Monospace, cyan).
    - *Headline:* `Crafted in the ` (Plus Jakarta Sans) + `glass realm.` (Cormorant Garamond italic inside a cyan-emerald crystal pill with a spinning `<AsteriskGlyph />`).
  - Animated via deterministic per-character 3D scatter-gather (`translate3d(x, y, 80px) -> translate3d(0, 0, 0)`) with dynamic `will-change` cleanup.
- **3. Scroll-Swiped "Floating Glass Realm" Slider (`requestAnimationFrame` Lerp Loop)**:
  - Binds horizontal track translation (`translate3d(-scrollX, 0, 0)`) to `swipeP * maxScrollX` inside the 60/120fps `requestAnimationFrame` lerp loop.
  - **3D Card Physics**: Dynamically applies `perspective(1200px) rotateY` tilt, scale, and inner visual parallax based on each card's normalized distance from the viewport center (`distFromCenter`).
  - **Liquid-Glass Card Styling**: `w-[80vw] md:w-[600px] h-[55dvh] rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/15`. The active centered card reaches `opacity: 1` with a luminous cyan border glow (`border-[#00d2ff]/45 shadow-[0_30px_90px_rgba(0,210,255,0.18)]`), while flanking cards fade toward `opacity: 0.5`.
- **4. Exact Vixa Portfolio Data Injection (4 Flagship Slider Cards + Full Archive)**:
  1. **N&I Group:** *Intelligent Enterprise* — Custom AI chatbot concierge and high-availability server architecture.
  2. **Higher Purpose Foundation:** *Digital Ecosystem* — Accessible humanitarian web platform and brand system.
  3. **DuoFinance:** *Shared Intelligence* — Partner finance tracking application with real-time sync.
  4. **Club EZ:** *Automated Community* — Custom moderation and leveling AI bot using Node.js and SQLite.
  - Each card includes an interactive dark-mode architectural UI simulation inside its glass viewport and an `"Inspect Case Study ↗"` button that opens the archive modal focused on that project.
- **5. Control Dock & Fullscreen Obsidian Archive Modal**:
  - **Bottom-Center Control Dock**: Sticky Liquid-Glass pill displaying live scroll progress (`01 — 04`) and the `"Explore All Projects ⊞"` button.
  - **Fullscreen Modal (`components/AllProjectsModal.tsx`)**: Frosted obsidian overlay (`bg-[#05070e]/90 backdrop-blur-3xl`) featuring category filter tabs (`All Works`, `Web & UI/UX`, `AI & Automation`, `Web Apps`), focused case-study inspection, and a responsive CSS Bento grid showcasing all 8 Vixa projects (*N&I Group*, *Higher Purpose Foundation*, *DuoFinance*, *Club EZ*, *Search Exam Essentials*, *GreenStep*, *Client Tracker Suite*, and *Liora*) with a direct `"Build Something Similar ↗"` booking handoff.

---

## Technical Architecture & Handoff Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Unified Scrollytelling & Stage 5 Glass Realm Architecture                 │
│  • Guardrail 1 (Decoder Cap):                                             │
│    - s >= 0.14: dayVideoRef.pause() + display:none / visibility:hidden    │
│    - Stage 5 active: roomVideoRef.play(); when meadow opacity === 0,      │
│      nightVideoRef.pause()                                                │
│  • Guardrail 2 (ResizeObserver Math):                                     │
│    - maxScrollX = sliderTrackRef.current.scrollWidth - window.innerWidth  │
│    - scrollX = swipeProgress * maxScrollX                                 │
└───────────────┬───────────────────────────────────────────┬───────────────┘
                │                                           │
                ▼                                           ▼
┌───────────────────────────────────────┐ ┌─────────────────────────────────┐
│ 3D Scatter-Gather Header & Slider     │ │ Control Dock & Archive Modal    │
│  • "05 // SELECTED ARCHITECTURE & AI" │ │  • Bottom Liquid-Glass Pill     │
│  • "Crafted in the glass realm."      │ │    (01 — 04 + Explore All ⊞)    │
│  • 4 Liquid-Glass 3D Cards:           │ │  • Fullscreen Obsidian Modal    │
│    01 N&I Group · 02 Higher Purpose   │ │    (bg-[#05070e]/90 + CSS Grid) │
│    03 DuoFinance · 04 Club EZ         │ │  • Case Study + Booking Handoff │
└───────────────────────────────────────┘ └─────────────────────────────────┘
```
