import { useState } from 'react';
import { ExternalLink, Github, X, Sparkles, Terminal, Layers, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { ARCHIVE_PROJECTS, type ArchiveProjectDef } from '@/space/content';

interface ProjectArchiveGridProps {
  onClose: () => void;
}

export default function ProjectArchiveGrid({ onClose }: ProjectArchiveGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeProject, setActiveProject] = useState<ArchiveProjectDef | null>(null);

  const categories = ['ALL', 'DISTRIBUTED', 'GRAPHICS', 'EDGE AI', 'DATABASE', 'CRYPTOGRAPHY', 'FINTECH'];

  const filteredProjects = ARCHIVE_PROJECTS.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'DISTRIBUTED') return p.category.includes('DISTRIBUTED');
    if (selectedCategory === 'GRAPHICS') return p.category.includes('GRAPHICS');
    if (selectedCategory === 'EDGE AI') return p.category.includes('AI');
    if (selectedCategory === 'DATABASE') return p.category.includes('DATABASE');
    if (selectedCategory === 'CRYPTOGRAPHY') return p.category.includes('CRYPTOGRAPHY');
    if (selectedCategory === 'FINTECH') return p.category.includes('FINANCIAL');
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Outer Asteroid Belt Project Catalog"
      className="pointer-events-auto fixed inset-0 z-40 bg-[#030407]/95 backdrop-blur-2xl flex flex-col px-5 sm:px-9 pt-20 pb-6 sm:pb-8 select-none animate-fade-up overflow-hidden"
    >
      {/* 1. TOP HEADER & TELEMETRY NAV */}
      <header className="shrink-0 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EAC078] shadow-[0_0_10px_#FFF4D0] animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-[#EAC078] uppercase">
              SECTOR 01-B // DEEP ASTEROID BELT CATALOG
            </span>
          </div>
          <h2 className="font-tall font-bold text-2xl sm:text-4xl uppercase tracking-tight text-[#FAF8F5] mt-1 leading-none">
            ENGINEERING ARCHIVE & REPOSITORIES
          </h2>
          <p className="font-mono text-[10px] text-neutral-400 mt-1 hidden sm:block">
            Full-stack protocols, distributed systems, custom graphics engines & developer tooling
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Return to orbital moons"
          className="group flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-lg border border-white/20 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-amber-300/70 hover:bg-amber-300/10 transition cursor-pointer"
        >
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-neutral-400 group-hover:text-amber-200">
            CLOSE CATALOG
          </span>
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* 2. CATEGORY FILTER CHIPS */}
      {!activeProject && (
        <div className="shrink-0 flex items-center gap-2 py-3.5 border-b border-white/10 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded font-mono text-[8.5px] sm:text-[9.5px] tracking-[0.15em] uppercase transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-300/20 border border-amber-300/70 text-amber-200 font-semibold shadow-[0_0_12px_rgba(234,192,120,0.2)]'
                  : 'bg-white/[0.03] border border-white/10 text-neutral-400 hover:text-white hover:border-white/25'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto font-mono text-[9px] text-white/40 tracking-widest hidden md:inline">
            // {filteredProjects.length} PROTOCOLS AVAILABLE
          </span>
        </div>
      )}

      {/* 3. MAIN BODY: PROJECT GRID OR DETAIL VIEW */}
      <div className="flex-1 overflow-y-auto py-5 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
        {activeProject ? (
          /* DEEP DETAIL VIEW FOR SELECTED ARCHIVE PROJECT */
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
            <button
              type="button"
              onClick={() => setActiveProject(null)}
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#EAC078] hover:text-[#FFF4D0] transition uppercase cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO CATALOG
            </button>

            <div className="forge-card p-6 sm:p-8 rounded-xl border border-white/20 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="font-mono text-[9.5px] tracking-[0.22em] text-[#EAC078] uppercase">
                    {activeProject.code} // {activeProject.category}
                  </span>
                  <h3 className="font-tall font-bold text-3xl sm:text-5xl uppercase tracking-tight text-[#FAF8F5] mt-1 leading-none">
                    {activeProject.name}
                  </h3>
                  <p className="font-serif italic text-base sm:text-lg text-amber-100/90 mt-1">
                    {activeProject.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {activeProject.liveUrl && (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#EAC078] text-[#030407] font-mono text-[9.5px] font-semibold tracking-wider uppercase hover:bg-[#FFF4D0] transition shadow-[0_0_15px_rgba(234,192,120,0.3)] cursor-pointer"
                    >
                      <span>LIVE PLATFORM</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {activeProject.repoUrl && (
                    <a
                      href={activeProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded bg-white/[0.08] border border-white/20 text-[#FAF8F5] font-mono text-[9.5px] tracking-wider uppercase hover:bg-white/[0.15] transition cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GITHUB</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Hard Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-white/10 py-4">
                {activeProject.metrics.map((m, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400">
                      {m.label}
                    </span>
                    <span className="font-tall font-bold text-xl sm:text-2xl text-amber-200 mt-0.5">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description & Architecture Breakdown */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5 mb-2">
                    <Layers className="w-3 h-3" />
                    SYSTEM SUMMARY
                  </h4>
                  <p className="font-sans text-xs sm:text-sm leading-relaxed text-[#DCD8D0]">
                    {activeProject.description}
                  </p>
                </div>

                <div className="forge-well p-4 sm:p-5 rounded border border-white/15">
                  <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5 mb-2">
                    <Terminal className="w-3 h-3" />
                    ARCHITECTURAL BLUEPRINT
                  </h4>
                  <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-neutral-300">
                    {activeProject.architecture}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#EAC078] flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3 h-3" />
                    KEY ENGINEERING HIGHLIGHTS
                  </h4>
                  <ul className="space-y-2">
                    {activeProject.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans">
                        <span className="font-mono text-[9px] text-[#EAC078] font-bold mt-0.5">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#EAC078] mb-2.5">
                    TECHNOLOGY COMPILATION
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/15 font-mono text-[9px] text-neutral-200 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                        <span className="text-white/45">{tech.category}:</span>
                        <span className="text-[#FAF8F5] font-medium">{tech.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GRID VIEW OF CATALOG */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setActiveProject(project)}
                className="group forge-card hud-panel chamfer-clip p-5 sm:p-6 rounded-xl border border-white/15 hover:border-amber-300/60 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-[0_12px_40px_rgba(234,192,120,0.15)]"
                style={{ '--glow-x': '50%', '--glow-y': '0%', '--rim-angle': '145deg' } as React.CSSProperties}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] sm:text-[8.5px] tracking-[0.2em] text-[#EAC078] uppercase">
                      {project.code} // {project.category}
                    </span>
                    <span className="font-mono text-[7.5px] px-1.5 py-0.5 rounded bg-white/[0.08] text-white/70 border border-white/10 uppercase">
                      {project.status}
                    </span>
                  </div>

                  <h3 className="font-tall font-bold text-2xl sm:text-3xl uppercase tracking-tight text-[#FAF8F5] mt-2 group-hover:text-amber-200 transition">
                    {project.name}
                  </h3>
                  <p className="font-serif italic text-xs sm:text-[13px] text-amber-100/75 mt-1 line-clamp-1">
                    {project.tagline}
                  </p>

                  <p className="font-sans text-xs leading-relaxed text-neutral-300 mt-3 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/10">
                  {/* Top 2 Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-[7.5px]">
                    {project.metrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="bg-white/[0.02] p-1.5 rounded border border-white/10">
                        <span className="text-white/40 uppercase block">{m.label}</span>
                        <span className="text-amber-200 font-bold text-[10px]">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Explore Action */}
                  <div className="flex items-center justify-between text-neutral-400 group-hover:text-amber-200 transition font-mono text-[8.5px] tracking-[0.16em] uppercase">
                    <span>INSPECT DEEP SPECS</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

