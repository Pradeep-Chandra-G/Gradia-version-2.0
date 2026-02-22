import React from "react";
import HeroCardsContainer from "./HeroCardsContainer";

function Hero() {
  return (
    <div>
      <div className="flex flex-col md:flex-row py-32 md:py-48 px-2 items-center md:justify-between">
        {/* Hero Text */}
        <div className="flex flex-col justify-center text-5xl/16 md:text-6xl font-black tracking-tight gap-8 md:gap-2.5">
          <h1>Enterprise-Grade</h1>
          <h1>Assessments for</h1>
          <h1>Modern Education</h1>
        </div>

        {/* Hero Cards */}
        <div className="md:pr-16">
          <HeroCardsContainer width={640} height={368} stagger={24} />
        </div>
      </div>
    </div>
  );
}

export default Hero;
