'use client';

import React, {useState} from 'react';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {LiquidGlassFilters, LiquidGlassSurface} from './LiquidGlass';

export type NavSectionKey =
  | 'Services'
  | 'Works'
  | 'AI Solutions'
  | 'Philosophy';

interface NavbarProps {
  activeNav: NavSectionKey | null;
  isNightMode: boolean;
  onSelectNav: (item: NavSectionKey) => void;
  onScrollTop: () => void;
  onOpenBooking: () => void;
}

const NAV_ITEMS: NavSectionKey[] = [
  'Services',
  'Works',
  'AI Solutions',
  'Philosophy',
];

export default function Navbar({
  activeNav,
  isNightMode,
  onSelectNav,
  onScrollTop,
  onOpenBooking,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-5 md:top-7 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 pointer-events-none">
      {/* Mount Synchronous SVG Crystal Refraction Filters */}
      <LiquidGlassFilters />

      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        {/* Far Left: Bare Minimal Logo WITHOUT any glass effect (transitions to white at night) */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onScrollTop();
          }}
          className={`pointer-events-auto font-sans text-xl md:text-2xl font-bold tracking-[-0.04em] transition-colors duration-500 whitespace-nowrap shrink-0 focus-visible:outline-none ${
            isNightMode
              ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]'
              : 'text-[#1c3324]'
          }`}
        >
          Vixa<span className="text-[#00d2ff]">.</span>
        </a>

        {/* Far Right: Crystal Liquid-Glass Pill Capsule Navbar */}
        <div className="pointer-events-auto flex items-center">
          <LiquidGlassSurface
            variant="nav"
            tint="sky-pill"
            roundedClass="rounded-full"
            className="hidden md:flex items-center pl-7 pr-1.5 py-1.5 transition-all duration-500"
          >
            <div className="flex items-center gap-7 lg:gap-8">
              <nav
                aria-label="Primary Navigation"
                className="flex items-center gap-6 lg:gap-7 text-[13.5px] font-sans font-medium"
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = activeNav === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSelectNav(item)}
                      className={`relative py-1 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_1px_4px_rgba(16,38,52,0.35)] ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {item}
                      <span
                        className={`absolute left-0 -bottom-0.5 h-[1.5px] w-full bg-[#00d2ff] rounded-full transition-transform duration-300 origin-left ${
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Nested Solid White Pill Button on the Far Right inside the Crystal Glass Capsule */}
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#f7faf8] active:scale-[0.98] text-[#15241b] text-[13px] font-sans font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Initiate Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.25] text-[#15241b]" />
              </button>
            </div>
          </LiquidGlassSurface>

          {/* Mobile Crystal-Glass Trigger */}
          <div className="md:hidden flex items-center gap-2">
            <LiquidGlassSurface
              as="button"
              variant="pill"
              tint="sky-pill"
              roundedClass="rounded-full"
              onClick={() => setMobileOpen((prev) => !prev)}
              ariaLabel={
                mobileOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              className="px-4 py-2.5 text-white text-xs font-sans font-medium"
            >
              <span className="inline-flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(16,38,52,0.28)]">
                <span>Menu</span>
                {mobileOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </span>
            </LiquidGlassSurface>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Pill */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden mt-3 flex justify-end">
          <LiquidGlassSurface
            variant="card"
            tint="card-glass"
            roundedClass="rounded-[24px]"
            className="p-4 w-full max-w-xs"
          >
            <div className="w-full flex flex-col gap-2.5 font-sans">
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onSelectNav(item);
                      setMobileOpen(false);
                    }}
                    className={`text-left px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#00d2ff] bg-white/15 font-semibold'
                        : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenBooking();
                }}
                className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#15241b] text-xs font-semibold"
              >
                <span>Initiate Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </LiquidGlassSurface>
        </div>
      )}
    </header>
  );
}
