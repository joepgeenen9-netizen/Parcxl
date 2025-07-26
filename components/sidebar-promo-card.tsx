"use client"

export default function SidebarPromoCard() {
  return (
    <div className="mx-3 mb-4">
      <div className="bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(32,105,255,0.4)] hover:transform hover:translate-y-[-4px] hover:scale-[1.02]">
        {/* Enhanced decorative background elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-8 -translate-y-8 transition-all duration-700 group-hover:scale-110 group-hover:bg-white/15"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-4 translate-y-4 transition-all duration-700 group-hover:scale-125 group-hover:bg-white/15"></div>

        {/* Additional floating elements for more fancy effect */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white/5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 group-hover:scale-150 group-hover:bg-white/10"></div>
        <div className="absolute top-3 left-3 w-2 h-2 bg-white/20 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:bg-white/30"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 bg-white/15 rounded-full transition-all duration-700 group-hover:scale-125 group-hover:bg-white/25"></div>

        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full"></div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="font-bold text-base mb-2 leading-tight transition-all duration-300 group-hover:text-blue-50">
            Ontdek nieuwe functies
          </h3>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed transition-all duration-300 group-hover:text-blue-50">
            Automatiseer je verzendproces
          </p>
          <button className="bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)] group-hover:bg-white/30 group-hover:scale-105 border border-white/10 hover:border-white/20">
            Meer info
          </button>
        </div>

        {/* Subtle border glow effect */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 transition-all duration-500 group-hover:border-white/20"></div>
      </div>
    </div>
  )
}
