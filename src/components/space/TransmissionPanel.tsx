import { useRef, useState, type FormEvent } from 'react';
import { Check, Send } from 'lucide-react';
import { sendTransmission } from '@/lib/transmitClient';
import { type TransmissionScope } from '@/types/transmission';

interface TransmissionPanelProps {
  onBroadcast: () => void;
}

interface TransmissionForm {
  scope: TransmissionScope;
  name: string;
  email: string;
  message: string;
}

type SubmitStatus =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

const EMPTY_FORM: TransmissionForm = { scope: 'software', name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPLAY_SCOPES: readonly { value: TransmissionScope; label: string }[] = [
  { value: 'software', label: 'Software' },
  { value: 'uiux', label: 'Interface' },
  { value: 'identity', label: 'Identity' },
  { value: 'other', label: 'Other' },
];

function validate(form: TransmissionForm): string | null {
  if (!form.name.trim()) return 'Enter your name.';
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.';
  if (form.message.trim().length < 10) return 'Your message needs at least 10 characters.';
  return null;
}

export default function TransmissionPanel({ onBroadcast }: TransmissionPanelProps) {
  const [form, setForm] = useState<TransmissionForm>(EMPTY_FORM);
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const mountedAtRef = useRef(Date.now());
  const sending = status.kind === 'sending';

  const updateField = <K extends keyof TransmissionForm>(key: K, value: TransmissionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (status.kind === 'error') {
      setStatus({ kind: 'idle' });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const problem = validate(form);
    if (problem) {
      setStatus({ kind: 'error', message: problem });
      return;
    }

    setStatus({ kind: 'sending' });
    const dwellMs = Date.now() - mountedAtRef.current;
    const res = await sendTransmission({
      scope: form.scope,
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      companyWebsite,
      dwellMs,
    });

    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error });
      return;
    }

    onBroadcast();
    setForm(EMPTY_FORM);
    setCompanyWebsite('');
    setStatus({ kind: 'sent' });
  };

  return (
    <section
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-20"
      aria-label="Sector 03 Quantum Uplink"
    >
      {/* 1. TOP-RIGHT ANIMATED RADAR TELEMETRY WIDGET (UPLINK-02) */}
      <div
        className="pointer-events-none absolute top-[4.8%] right-[11.2%] hidden lg:flex items-center gap-3 z-20"
        aria-hidden="true"
      >
        <div className="relative w-[15vh] h-[15vh] min-w-[106px] min-h-[106px]">
          <svg viewBox="0 0 130 130" className="w-full h-full">
            <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(236,232,225,0.16)" strokeWidth="0.8" />
            {/* Counter-rotating radial tick ring */}
            <g className="svg-origin-center animate-orbit-ccw">
              <path
                d="M 18 76 A 48 48 0 0 1 65 17"
                fill="none"
                stroke="rgba(236,232,225,0.48)"
                strokeWidth="4"
                strokeDasharray="1.2 2.8"
              />
              <path
                d="M 112 54 A 48 48 0 0 1 65 113"
                fill="none"
                stroke="rgba(236,232,225,0.22)"
                strokeWidth="2.5"
                strokeDasharray="1.2 3.2"
              />
            </g>
            <circle cx="65" cy="65" r="39" fill="rgba(5,9,16,0.45)" stroke="rgba(236,232,225,0.22)" strokeWidth="0.9" />
            {/* Clockwise rotating scanner arc + glowing node */}
            <g className="svg-origin-center animate-orbit-fast">
              <path
                d="M 65 30 A 35 35 0 0 1 98 56"
                fill="none"
                stroke="#DCEEF2"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="96" cy="48" r="3" fill="#FFFFFF" />
              <circle cx="96" cy="48" r="6.5" fill="rgba(220,238,242,0.3)" />
            </g>
            <circle cx="65" cy="65" r="21" fill="none" stroke="rgba(236,232,225,0.18)" strokeWidth="0.7" />
            <circle cx="65" cy="65" r="2" fill="#DCEEF2" className="animate-pulse-soft" />
          </svg>
        </div>
        <div className="font-mono text-[9.5px] leading-[1.35] tracking-[0.12em] text-[#E6E2DA] uppercase -ml-2 -mt-5">
          <div className="text-[#C8C4BC]">UPLINK-02:</div>
          <div>HALO VAULT STATUS</div>
        </div>
      </div>

      {/* 2. LEFT EDITORIAL COPY BLOCK: Establish Transmission */}
      <div className="pointer-events-none absolute top-[43.2%] left-[6%] sm:left-[10.6%] max-w-[420px] z-20">
        <h2
          className="font-serif font-normal text-[#F7F5F0] leading-[1.06] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(1.85rem, 3.25vw, 3.05rem)' }}
        >
          Establish Transmission
        </h2>
        <p className="font-sans font-light text-[12.5px] sm:text-[13.8px] leading-[1.48] text-[#DCD8D0] mt-2.5">
          Transmit mission-critical telemetry or project
          <br className="hidden sm:inline" /> requirements via this encrypted direct link.
        </p>
      </div>

      {/* 3. BOTTOM-LEFT ANIMATED CONCENTRIC RADAR (45° DIAGONAL 'X' AXES — NO '+' CROSS) */}
      <div
        className="pointer-events-none absolute bottom-[4.8%] left-[3.8%] hidden lg:flex items-center z-20"
        aria-hidden="true"
      >
        <svg viewBox="0 0 340 210" className="w-[335px] h-[206px] overflow-visible">
          <g transform="translate(102, 105)">
            {/* 45-degree Diagonal 'X' Reference Axes (gapped around center ring — never a '+') */}
            <line x1="-78" y1="-78" x2="-12" y2="-12" stroke="rgba(236,232,225,0.14)" strokeWidth="0.75" />
            <line x1="12" y1="12" x2="78" y2="78" stroke="rgba(236,232,225,0.14)" strokeWidth="0.75" />
            <line x1="-78" y1="78" x2="-12" y2="12" stroke="rgba(236,232,225,0.14)" strokeWidth="0.75" />
            <line x1="12" y1="-12" x2="78" y2="-78" stroke="rgba(236,232,225,0.14)" strokeWidth="0.75" />

            {/* Outer stationary frame */}
            <circle r="92" fill="rgba(5,8,14,0.44)" stroke="rgba(236,232,225,0.2)" strokeWidth="0.9" />

            {/* Rotating Outer Radial Tick Ring */}
            <g style={{ transformOrigin: '0px 0px' }} className="animate-orbit-cw">
              <circle
                r="80"
                fill="none"
                stroke="rgba(236,232,225,0.36)"
                strokeWidth="4.5"
                strokeDasharray="1.1 3.2"
              />
            </g>

            {/* Counter-Rotating Middle Scanner Arc */}
            <circle r="63" fill="none" stroke="rgba(236,232,225,0.2)" strokeWidth="0.9" />
            <g style={{ transformOrigin: '0px 0px' }} className="animate-orbit-ccw">
              <path
                d="M -45 -44 A 63 63 0 0 0 -45 44"
                fill="none"
                stroke="#E4EEF0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 45 44 A 63 63 0 0 0 58 -22"
                fill="none"
                stroke="rgba(243,212,139,0.5)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>

            {/* Inner Rotating Tick Track & Fast Sweep Crescent */}
            <circle
              r="46"
              fill="none"
              stroke="rgba(236,232,225,0.28)"
              strokeWidth="2.8"
              strokeDasharray="1.2 2.8"
            />
            <circle r="33" fill="rgba(4,7,12,0.72)" stroke="rgba(236,232,225,0.26)" strokeWidth="1" />
            <g style={{ transformOrigin: '0px 0px' }} className="animate-orbit-fast">
              <path
                d="M 8 -31 A 32 32 0 0 1 31 -6"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <circle cx="31" cy="-6" r="2.2" fill="#DCEEF2" />
            </g>

            {/* Center Diagonal 'X' Emblem + Orbital Core Ring */}
            <circle r="8.5" fill="none" stroke="rgba(236,232,225,0.35)" strokeWidth="0.8" />
            <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" stroke="#FFFFFF" strokeWidth="1.15" strokeLinecap="round" />
            <line x1="-5.5" y1="5.5" x2="5.5" y2="-5.5" stroke="#FFFFFF" strokeWidth="1.15" strokeLinecap="round" />
            <circle r="2.2" fill="#DCEEF2" />

            {/* Callout Leader 1 -> UPLINK-01 */}
            <polyline
              points="46,-16 76,-44 114,-44"
              fill="none"
              stroke="rgba(236,232,225,0.55)"
              strokeWidth="0.9"
            />
            <circle cx="116" cy="-44" r="2.2" fill="#FFFFFF" />

            {/* Callout Leader 2 -> UPLINK-02 */}
            <line x1="34" y1="8" x2="122" y2="8" stroke="rgba(236,232,225,0.55)" strokeWidth="0.9" />
            <circle cx="124" cy="8" r="2.2" fill="#FFFFFF" />
          </g>

          <text
            x="228"
            y="58"
            fill="#DCD8D0"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="1.1"
          >
            <tspan x="228" dy="0" fill="#B8B4AC">
              UPLINK-01:
            </tspan>
            <tspan x="228" dy="13">
              LYRA CRM NODE
            </tspan>
          </text>

          <text
            x="236"
            y="110"
            fill="#DCD8D0"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="1.1"
          >
            <tspan x="236" dy="0" fill="#B8B4AC">
              UPLINK-02:
            </tspan>
            <tspan x="236" dy="13">
              HALO VAULT
            </tspan>
            <tspan x="236" dy="13">
              STATUS
            </tspan>
          </text>
        </svg>
      </div>

      {/* 4. LUXURY POLISHED BOTTOM-RIGHT TRANSMISSION CONSOLE */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="pointer-events-auto absolute bottom-5 right-4 sm:right-[3.2%] sm:bottom-[4.2%] flex flex-col sm:flex-row items-stretch sm:items-end gap-3 z-30 max-w-[94vw]"
        style={{
          transform: 'perspective(1200px) rotateY(-5deg) rotateX(1deg)',
          transformOrigin: 'bottom right',
        }}
      >
        {/* Honeypot field for bot spam prevention */}
        <input
          type="text"
          name="companyWebsite"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0, margin: 0 }}
        />
        {/* LEFT POD: Architectural Glass SCOPE Selector */}
        <fieldset className="w-full sm:w-[126px] shrink-0 sm:mb-1">
          <div
            className="relative rounded-xl border border-amber-200/20 p-3 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={{
              background:
                'linear-gradient(165deg, rgba(38,24,14,0.76) 0%, rgba(11,13,20,0.9) 100%)',
            }}
          >
            {/* Precision top-left & bottom-right corner accents */}
            <span className="pointer-events-none absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" />
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8F3F8] shadow-[0_0_8px_rgba(216,243,248,0.8)]" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#ECE8E1]/90 uppercase">
                SCOPE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1.5">
              {DISPLAY_SCOPES.map((option) => {
                const selected = form.scope === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateField('scope', option.value)}
                    className={`chamfer-hex w-full py-2 px-3 font-serif text-[13.5px] tracking-[0.02em] transition-all duration-300 cursor-pointer text-center ${
                      selected
                        ? 'bg-gradient-to-r from-[#E4F7FA] via-[#F2FBFC] to-[#D4F0F6] text-[#071217] font-semibold shadow-[0_0_22px_rgba(205,244,252,0.55)]'
                        : 'bg-[#0D1018]/80 text-[#E2DED6]/85 hover:text-white hover:bg-white/[0.1] border border-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>

        {/* RIGHT CONSOLE: Executive Multi-Tier Sci-Fi Input Stack */}
        <div
          className="relative w-full sm:w-[378px] rounded-2xl border border-white/20 p-3.5 sm:p-4 backdrop-blur-2xl shadow-[0_28px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] flex flex-col gap-3"
          style={{
            background:
              'linear-gradient(145deg, rgba(36,25,17,0.68) 0%, rgba(9,13,21,0.9) 42%, rgba(6,10,17,0.95) 100%)',
          }}
        >
          {/* Luminous Cyan/Gold Telemetry Edge Accents */}
          <span
            className="pointer-events-none absolute top-0 left-6 right-10 h-[1px] bg-gradient-to-r from-amber-200/50 via-white/35 to-[#C5F1FA]/50"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-[2px] top-8 h-10 w-[3px] rounded-full bg-[#C5F1FA]/80 shadow-[0_0_12px_rgba(197,241,250,0.65)]"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-[2px] bottom-14 h-6 w-[2px] rounded-full bg-amber-200/50"
            aria-hidden="true"
          />

          {/* Console Micro-Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 px-0.5">
            <span className="font-mono text-[8.5px] tracking-[0.2em] text-amber-200/85 uppercase">
              03 // DIRECT QUANTUM CHANNEL
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[8px] tracking-[0.16em] text-[#C5F1FA]/85 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5F1FA] animate-pulse-soft" />
              ENCRYPTED
            </span>
          </div>

          {/* FIELD 1: NAME */}
          <label className="group block rounded-lg border border-white/12 bg-[#070B12]/75 px-3.5 py-2 transition-all duration-300 focus-within:border-[#C5F1FA]/65 focus-within:bg-[#091019]/90 focus-within:shadow-[0_0_20px_rgba(197,241,250,0.12)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#DCD8D0] group-focus-within:text-[#E2F5F8] uppercase transition">
                NAME
              </span>
              <span className="font-mono text-[7.5px] tracking-[0.14em] text-white/25">ID // 01</span>
            </div>
            <input
              value={form.name}
              maxLength={80}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent font-sans text-[13px] text-[#F7F5F0] placeholder:text-[#9E9B93]/70 outline-none"
            />
          </label>

          {/* FIELD 2: EMAIL */}
          <label className="group block rounded-lg border border-white/12 bg-[#070B12]/75 px-3.5 py-2 transition-all duration-300 focus-within:border-[#C5F1FA]/65 focus-within:bg-[#091019]/90 focus-within:shadow-[0_0_20px_rgba(197,241,250,0.12)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#DCD8D0] group-focus-within:text-[#E2F5F8] uppercase transition">
                EMAIL
              </span>
              <span className="font-mono text-[7.5px] tracking-[0.14em] text-white/25">RETURN // NODE</span>
            </div>
            <input
              type="email"
              value={form.email}
              maxLength={120}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-transparent font-sans text-[13px] text-[#F7F5F0] placeholder:text-[#9E9B93]/70 outline-none"
            />
          </label>

          {/* FIELD 3: MESSAGE */}
          <label className="group block rounded-lg border border-white/12 bg-[#070B12]/75 px-3.5 py-2 transition-all duration-300 focus-within:border-[#C5F1FA]/65 focus-within:bg-[#091019]/90 focus-within:shadow-[0_0_20px_rgba(197,241,250,0.12)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#DCD8D0] group-focus-within:text-[#E2F5F8] uppercase transition">
                MESSAGE
              </span>
              <span className="font-mono text-[7.5px] tracking-[0.14em] text-white/25">PAYLOAD</span>
            </div>
            <textarea
              value={form.message}
              maxLength={2000}
              rows={3}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="Briefly describe what you need."
              className="w-full resize-none bg-transparent font-sans text-[13px] leading-relaxed text-[#F7F5F0] placeholder:text-[#9E9B93]/70 outline-none"
            />
          </label>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div role="status" className="font-mono text-[9px] tracking-[0.08em] truncate">
              {status.kind === 'error' && (
                <span className="text-amber-300">{status.message}</span>
              )}
              {status.kind === 'sent' && (
                <span className="inline-flex items-center gap-1.5 text-[#D4F3F9]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  TRANSMISSION CONFIRMED
                </span>
              )}
              {status.kind === 'idle' && (
                <span className="text-white/40">AES-256 // READY</span>
              )}
              {status.kind === 'sending' && (
                <span className="text-[#D4F3F9]">UPLOADING TELEMETRY...</span>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="chamfer-hex inline-flex items-center gap-2 bg-gradient-to-r from-[#E2F5F8] via-[#F4FCFD] to-[#CFEFF6] hover:brightness-105 text-[#061015] font-mono font-semibold text-[10px] tracking-[0.16em] uppercase px-5 py-2 transition-all duration-300 shadow-[0_0_20px_rgba(205,244,252,0.42)] hover:shadow-[0_0_28px_rgba(205,244,252,0.7)] disabled:opacity-50 cursor-pointer shrink-0"
            >
              <span>{sending ? 'SENDING...' : 'TRANSMIT'}</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
