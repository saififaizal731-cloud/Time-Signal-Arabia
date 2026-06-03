import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1
            className="text-3xl tracking-tight text-[hsl(var(--foreground))]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Velorah<sup className="text-xs">®</sup>
          </h1>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-sm text-[hsl(var(--foreground))] transition-colors hover:text-[hsl(var(--muted-foreground))]"
          >
            Home
          </a>
          <a
            href="#"
            className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Studio
          </a>
          <a
            href="#"
            className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            About
          </a>
          <a
            href="#"
            className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Journal
          </a>
          <a
            href="#"
            className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Reach Us
          </a>
        </div>

        {/* CTA Button */}
        <button
          className="liquid-glass px-6 py-2.5 text-sm text-[hsl(var(--foreground))] hover:scale-[1.03] transition-transform duration-300 cursor-pointer"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px]">
        {/* H1 Headline */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-[hsl(var(--foreground))] animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-[hsl(var(--muted-foreground))]">dreams</em> rise{' '}
          <em className="not-italic text-[hsl(var(--muted-foreground))]">through the silence.</em>
        </h1>

        {/* Subtext */}
        <p className="text-[hsl(var(--muted-foreground))] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos,
          we build digital spaces for sharp focus and inspired work.
        </p>

        {/* CTA Button */}
        <button
          className="liquid-glass px-14 py-5 text-base text-[hsl(var(--foreground))] mt-12 hover:scale-[1.03] transition-transform duration-300 cursor-pointer animate-fade-rise-delay-2"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Begin Journey
        </button>
      </div>
    </div>
  );
};
