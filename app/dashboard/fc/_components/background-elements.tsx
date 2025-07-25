"use client"

export function BackgroundElements() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
      <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.03] top-[10%] right-[10%] animate-[float_20s_infinite_linear] bg-gradient-to-br from-[#2069ff] to-[#1557d4]" />
      <div
        className="absolute w-[200px] h-[200px] rounded-full opacity-[0.03] bottom-[20%] left-[5%] animate-[float_20s_infinite_linear] bg-gradient-to-br from-[#1557d4] to-[#2069ff]"
        style={{ animationDelay: "-10s" }}
      />
      <div
        className="absolute w-[150px] h-[150px] rounded-full opacity-[0.03] top-[60%] right-[30%] animate-[float_20s_infinite_linear] bg-gradient-to-br from-[#2069ff] to-[#1557d4]"
        style={{ animationDelay: "-5s" }}
      />

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(0px) rotate(180deg); }
          75% { transform: translateY(20px) rotate(270deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
