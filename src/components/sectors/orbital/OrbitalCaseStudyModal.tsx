import { useState } from 'react';
import { ExternalLink, Github, X, Activity, Layers, Cpu, ShieldCheck } from 'lucide-react';
import type { ProjectDef } from '@/space/content';

interface OrbitalCaseStudyModalProps {
  project: ProjectDef;
  onClose: () => void;
}

type TabType = 'overview' | 'challenges' | 'stack' | 'schematics';

export default function OrbitalCaseStudyModal({ project, onClose }: OrbitalCaseStudyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeViewportIndex, setActiveViewportIndex] = useState(0);

  const stats = project.orbitalStats;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} Orbital Case Study`}
      className="pointer-events-auto fixed z-40 left-3 right-3 bottom-4 top-[10%] sm:top-[12%] sm:left-[3.5%] sm:right-auto sm:w-[540px] xl:w-[600px] sm:max-h-[82vh] flex flex-col forge-card hud-panel chamfer-clip shadow-[0_20px_70px_rgba(0,0,0,0.85)] border border-white/20 backdrop-blur-2xl animate-fade-up select-none overflow-hidden"
      style={{ '--glow-x': '30%', '--glow-y': '20%', '--rim-angle': '135deg' } as React.CSSProperties}
    >
      {/* 1. AEROSPACE TELEMETRY HEADER */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#EAC078] shadow-[0_0_10px_#FFF4D0] animate-pulse" />
          <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-[#EAC078]">
            {project.code} // {stats?.orbitName ?? 'CELESTIAL STATION'}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Terminate observation"
          className="group flex items-center gap-2 px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-amber-300/60 hover:bg-amber-300/10 transition cursor-pointer"
        >
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase hidden sm:inline text-neutral-400 group-hover:text-amber-200">
            TERMINATE
          </span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. ORBITAL POSITION READOUT BAR */}
      {stats && (
        <div className="shrink-0 px-5 py-2 bg-[#050811]/70 border-b border-white/10 flex items-center justify-between font-mono text-[8px] sm:text-[8.5px] tracking-[0.16em] text-neutral-400 overflow-x-auto scrollbar-none">
          <div><span className="text-white/40">RAD:</span> <span className="text-[#ECE8E1]">{stats.radius}</span></div>
          <div><span className="text-white/40">VEL:</span> <span className="text-[#ECE8E1]">{stats.velocity}</span></div>
          <div><span className="text-white/40">INC:</span> <span className="text-[#ECE8E1]">{stats.inclination}</span></div>
          <div><span className="text-white/40">PER:</span> <span className="text-[#EAC078]">{stats.period}</span></div>
        </div>
      )}

      {/* 3. SCROLLABLE CASE STUDY CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
        {/* Title & Editorial Subtitle */}
        <div>
          <h2 className="font-tall font-bold text-3xl sm:text-5xl uppercase tracking-tight text-[#FAF8F5] leading-none">
            {project.name}
          </h2>
          <p className="mt-1.5 font-serif italic text-sm sm:text-base text-amber-100/80 leading-snug">
            {project.subtitle}
          </p>
        </div>

        {/* 4 Hard Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-y border-white/10 py-3.5 bg-white/[0.01]">
          {project.metrics.map((metric, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-mono text-[7.5px] sm:text-[8px] uppercase tracking-[0.18em] text-neutral-400">
                {metric.label}
              </span>
              <span className="font-tall font-bold text-lg sm:text-xl text-[#FAF8F5] mt-0.5 tracking-wide text-amber-200">
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        {/* Architectural Tabs Navigation */}
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-300/15 border border-amber-300/50 text-amber-200 font-semibold'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            // OVERVIEW
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`px-3 py-1.5 rounded font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase transition cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-amber-300/15 border border-amber-300/50 text-amber-200 font-semibold'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            // CHALLENGES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={`px-3 py-1.5 rounded font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase transition cursor-pointer ${
              activeTab === 'stack'
                ? 'bg-amber-300/15 border border-amber-300/50 text-amber-200 font-semibold'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            // TECH STACK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schematics')}
            className={`px-3 py-1.5 rounded font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase transition cursor-pointer ${
              activeTab === 'schematics'
                ? 'bg-amber-300/15 border border-amber-300/50 text-amber-200 font-semibold'
                : 'text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            // SCHEMATICS
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ARCHITECTURE */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-up">
            <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#DCD8D0]">
              {project.detail}
            </p>
            <div className="forge-well p-4 rounded border border-white/10 space-y-2">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                SYSTEM ARCHITECTURE NARRATIVE
              </span>
              <p className="font-sans text-xs sm:text-[12.5px] leading-relaxed text-neutral-300">
                {project.architectureNarrative}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ENGINEERING CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-3 animate-fade-up">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              CRITICAL FULL-STACK PROBLEMS SOLVED
            </span>
            <div className="space-y-2.5">
              {project.engineeringChallenges.map((challenge, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded bg-white/[0.02] border border-white/10">
                  <span className="font-mono text-[9px] text-[#EAC078] font-bold mt-0.5">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <p className="font-sans text-xs leading-relaxed text-neutral-300">
                    {challenge}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM STACK */}
        {activeTab === 'stack' && (
          <div className="space-y-3.5 animate-fade-up">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              DEPLOYED ARCHITECTURAL MATRIX
            </span>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/15 hover:border-amber-300/50 transition font-mono text-[9px] text-neutral-200 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                  <span className="text-white/45">{tech.category}:</span>
                  <span className="text-[#FAF8F5] font-medium">{tech.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SCHEMATICS & VIEWPORTS */}
        {activeTab === 'schematics' && (
          <div className="space-y-3.5 animate-fade-up">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              SYSTEM TELEMETRY VIEWPORTS ({project.screenshots.length})
            </span>

            {/* Viewport Selector Tabs */}
            <div className="flex gap-2">
              {project.screenshots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveViewportIndex(idx)}
                  className={`px-2.5 py-1 rounded text-[8px] font-mono tracking-widest uppercase transition ${
                    activeViewportIndex === idx
                      ? 'bg-amber-200/20 text-amber-200 border border-amber-300/60'
                      : 'text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  VIEW 0{idx + 1}
                </button>
              ))}
            </div>

            {/* Viewport Frame */}
            {project.screenshots[activeViewportIndex] && (
              <div className="forge-well p-4 rounded border border-white/15 space-y-3">
                <div className="flex items-center justify-between text-neutral-400 font-mono text-[8px] tracking-wider uppercase border-b border-white/10 pb-2">
                  <span>{project.screenshots[activeViewportIndex].title}</span>
                  <span className="text-[#EAC078]">{project.screenshots[activeViewportIndex].type}</span>
                </div>

                {/* Stylized Architectural Wireframe Visualizer */}
                <div className="w-full h-32 rounded bg-black/60 border border-white/10 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,192,120,0.08)_0%,transparent_70%)]" />
                  <svg className="w-full h-full text-amber-300/30" viewBox="0 0 200 80">
                    <line x1="10" y1="40" x2="190" y2="40" stroke="currentColor" strokeDasharray="2,2" />
                    <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" />
                    <circle cx="100" cy="40" r="22" fill="none" stroke="#EAC078" strokeOpacity="0.7" />
                    <circle cx="160" cy="40" r="14" fill="none" stroke="currentColor" />
                    <line x1="54" y1="40" x2="78" y2="40" stroke="#FFF4D0" />
                    <line x1="122" y1="40" x2="146" y2="40" stroke="#FFF4D0" />
                  </svg>
                  <span className="font-mono text-[7.5px] tracking-widest text-[#EAC078] uppercase mt-1">
                    SCHEMATIC: {project.screenshots[activeViewportIndex].title}
                  </span>
                </div>

                <p className="font-sans text-[11px] leading-relaxed text-neutral-300">
                  {project.screenshots[activeViewportIndex].description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. FOOTER ACTION ENDPOINTS */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#EAC078] text-[#030407] font-mono text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase hover:bg-[#FFF4D0] transition shadow-[0_0_20px_rgba(234,192,120,0.35)] cursor-pointer"
          >
            <span>LAUNCH PLATFORM</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded bg-white/[0.06] border border-white/20 text-[#FAF8F5] font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase hover:bg-white/[0.12] hover:border-white/40 transition cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>INSPECT REPO</span>
          </a>
        )}
      </div>
    </aside>
  );
}

