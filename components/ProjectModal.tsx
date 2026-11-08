'use client';

import React, {useState} from 'react';
import {X, CheckCircle2, ArrowUpRight} from 'lucide-react';
import {LiquidGlassSurface} from './LiquidGlass';

interface ProjectModalProps {
  isOpen: boolean;
  initialTrack?: string;
  onClose: () => void;
}

const SERVICE_TRACKS = [
  'Web Architecture',
  'UI/UX Design',
  'AI Integration',
  'Full-Stack Ecosystem',
];

export default function ProjectModal({
  isOpen,
  initialTrack,
  onClose,
}: ProjectModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>(() => {
    if (initialTrack && SERVICE_TRACKS.includes(initialTrack)) {
      return initialTrack;
    }
    return 'Full-Stack Ecosystem';
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/15"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg"
      >
        <LiquidGlassSurface
          variant="card"
          tint="card-glass"
          roundedClass="rounded-[28px]"
          className="p-6 sm:p-8 text-white w-full"
        >
          <div className="w-full drop-shadow-[0_1px_6px_rgba(10,24,14,0.45)]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#eef8ff]">
                  VIXA DISCOVERY CALL
                </div>
                <h2
                  id="booking-modal-title"
                  className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight"
                >
                  {submitted ? 'Project Brief Confirmed' : 'Initiate Project'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close booking modal"
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/50 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-white/15 border border-white/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#a7f3d0]" />
                    <span>Invitation sent to {email}</span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Thank you, {name}. A Vixa principal architect will follow up
                    within 24 hours to finalize your{' '}
                    <span className="font-semibold">{selectedTrack}</span>{' '}
                    session.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 text-xs font-semibold text-[#15241b] bg-white rounded-full cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <span className="block text-xs font-medium text-white/95 mb-2">
                    Focus Area
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TRACKS.map((track) => {
                      const active = selectedTrack === track;
                      return (
                        <button
                          key={track}
                          type="button"
                          onClick={() => setSelectedTrack(track)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-white text-[#15241b] border-white'
                              : 'bg-white/15 text-white border-white/45 hover:bg-white/25'
                          }`}
                        >
                          {track}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="book-name"
                      className="block text-xs font-medium text-white/95 mb-1"
                    >
                      Your Name *
                    </label>
                    <input
                      id="book-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/60 bg-white/15 border border-white/45 rounded-xl focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="book-email"
                      className="block text-xs font-medium text-white/95 mb-1"
                    >
                      Work Email *
                    </label>
                    <input
                      id="book-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/60 bg-white/15 border border-white/45 rounded-xl focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="book-notes"
                    className="block text-xs font-medium text-white/95 mb-1"
                  >
                    Project Overview (Optional)
                  </label>
                  <textarea
                    id="book-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about your website, UI/UX, or AI goals..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/60 bg-white/15 border border-white/45 rounded-xl focus:outline-none focus:border-white resize-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-semibold text-rose-200">
                    {error}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 text-xs sm:text-[13px] font-semibold text-[#15241b] bg-white hover:bg-[#f7faf8] rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Confirm Project Call</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </LiquidGlassSurface>
      </div>
    </div>
  );
}
