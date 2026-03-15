import React from 'react';

export function HeroTitle() {
  return (
    <div 
      className="relative w-full max-w-4xl mx-auto py-4 select-none group animate-slide-up" 
      style={{ fontFamily: "'Press Start 2P', monospace", transform: 'skewX(-8deg)' }}
    >
      <div className="flex flex-col items-center gap-6 lg:gap-8 transform origin-center transition-transform duration-500 hover:scale-[1.02]">
        <HeroTextLine text="EARN SMART!" />
        <HeroTextLine text="EARN MORE!" />
      </div>
    </div>
  );
}

function HeroTextLine({ text }: { text: string }) {
  // Thick borders and isometric shadows for 8-bit aesthetic
  const strokeWidth = "clamp(6px, 1vw, 12px)";
  
  return (
    <div className="relative text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] whitespace-nowrap leading-none tracking-tight">
      
      {/* LAYER 1: Deep Purple Block Shadow */}
      <div 
        className="absolute top-0 left-0 w-full" 
        style={{ 
          color: '#6e4ac7',
          transform: 'translate(6px, 8px)',
          WebkitTextStroke: `${strokeWidth} #6e4ac7`,
          zIndex: 1
        }}
        aria-hidden="true"
      >
        {text}
      </div>

      {/* LAYER 2: Thick White Border */}
      <div 
        className="absolute top-0 left-0 w-full text-white" 
        style={{ 
          WebkitTextStroke: `${strokeWidth} white`,
          zIndex: 2
        }}
        aria-hidden="true"
      >
        {text}
      </div>

      {/* LAYER 3: Main Gradient Fill */}
      <div 
        className="relative" 
        style={{ 
          background: 'linear-gradient(180deg, #f7d4fd 0%, #dfa5fb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          zIndex: 3,
        }}
      >
        {text}
      </div>

      {/* LAYER 4: Digital Glitch Artifacts */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-overlay opacity-80" style={{ zIndex: 4 }}>
        {/* We place a few static white bars to simulate the glitch artifact from the image */}
        <div className="absolute w-3 h-1.5 bg-white top-[25%] left-[8%]" />
        <div className="absolute w-2 h-1 bg-white top-[32%] left-[9%]" />
        <div className="absolute w-4 h-1.5 bg-white top-[60%] left-[10%]" />
        
        <div className="absolute w-3 h-1.5 bg-white top-[20%] left-[53%]" />
        <div className="absolute w-2 h-1 bg-white top-[28%] left-[54%]" />
        <div className="absolute w-5 h-2 bg-white top-[55%] left-[52%]" />
        
        <div className="absolute w-2 h-1 bg-white top-[70%] left-[82%]" />
      </div>
      
    </div>
  );
}
