'use client';

export default function ScrollingLogos() {
  return (
    <section className="py-16 bg-revnu-darker border-t border-revnu-slate/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
        <p className="text-center text-sm font-bold text-revnu-gray uppercase tracking-wider">
          Trusted by contractors across the US
        </p>
      </div>

      {/* Scrolling Logo Strip */}
      <div className="relative">
        <div className="flex gap-12 animate-scroll">
          {/* First set of logos */}
          <div className="flex gap-12 items-center min-w-max">
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">SMITH ELECTRICAL</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">APEX HVAC</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">PRO PLUMBING</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">ELITE ROOFING</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">MODERN BUILDERS</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">PRECISION CONCRETE</div>
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-12 items-center min-w-max">
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">SMITH ELECTRICAL</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">APEX HVAC</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">PRO PLUMBING</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">ELITE ROOFING</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">MODERN BUILDERS</div>
            <div className="text-2xl font-black text-revnu-gray/40 whitespace-nowrap">PRECISION CONCRETE</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
