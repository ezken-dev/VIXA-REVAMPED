'use client';

import React, {useState, useCallback} from 'react';
import Navbar, {type NavSectionKey} from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectModal from '@/components/ProjectModal';

const HERO_PHASE_SCROLL_TARGETS: Record<NavSectionKey, number> = {
  Services: 0.13,
  Works: 0.62,
  'AI Solutions': 0.39,
  Philosophy: 0.49,
};

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavSectionKey | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  const [bookingOpen, setBookingOpen] = useState<boolean>(false);
  const [bookingTrack, setBookingTrack] = useState<string | undefined>(
    undefined
  );

  const handlePhaseChange = useCallback(
    (phase: NavSectionKey | null, isNight: boolean) => {
      setActiveNav(phase);
      setIsNightMode(isNight);
    },
    []
  );

  const handleSelectNav = (item: NavSectionKey) => {
    const ratio = HERO_PHASE_SCROLL_TARGETS[item];
    const heroEl = document.getElementById('hero');
    const heroScrollable = heroEl
      ? Math.max(1, heroEl.offsetHeight - window.innerHeight)
      : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: ratio * heroScrollable,
      behavior: 'smooth',
    });
  };

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleOpenBooking = (defaultTrack?: string) => {
    setBookingTrack(defaultTrack);
    setBookingOpen(true);
  };

  return (
    <main className="relative w-full min-h-screen bg-[#05070e]">
      <Navbar
        activeNav={activeNav}
        isNightMode={isNightMode}
        onSelectNav={handleSelectNav}
        onScrollTop={handleScrollTop}
        onOpenBooking={() => handleOpenBooking()}
      />
      <Hero
        onPhaseChange={handlePhaseChange}
        onOpenBooking={handleOpenBooking}
      />
      <ProjectModal
        key={bookingTrack || 'default'}
        isOpen={bookingOpen}
        initialTrack={bookingTrack}
        onClose={() => setBookingOpen(false)}
      />
    </main>
  );
}
