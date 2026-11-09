interface BrandMotionPodProps {
  onHover?: (active: boolean) => void;
}

export function BrandMotionPod({ onHover }: BrandMotionPodProps) {
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="pointer-events-auto absolute top-[36.2%] right-[2.2%] hidden lg:block w-[226px] pl-4 pt-3 z-20"
    >
      {/* Luminous champagne-to-transparent L-corner hairlines + vertex jewel */}
      <span
        className="pointer-events-none absolute top-0 left-0 right-4 h-[1px] bg-gradient-to-r from-amber-200/55 via-white/25 to-transparent"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute top-0 left-0 bottom-2 w-[1px] bg-gradient-to-b from-amber-200/55 via-white/20 to-transparent"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -top-[2px] -left-[2px] w-[5px] h-[5px] rounded-full bg-[#FBF2D5] shadow-[0_0_8px_rgba(251,242,213,0.9)]"
        aria-hidden="true"
      />

      <div className="font-mono text-[8.5px] tracking-[0.2em] text-amber-200/85 uppercase">
        03 // MOTION SYSTEMS
      </div>
      <h3 className="font-serif text-[19px] leading-[1.12] text-[#FAF8F4] mt-1">
        Brand &amp; Motion Direction
      </h3>
      <p className="font-sans font-light text-[11.5px] leading-[1.48] text-[#D4D0C8] mt-1.5">
        Distinctive spatial typography, procedural 3D shaders, and physics-driven motion crafted
        without compromise.
      </p>
    </div>
  );
}

