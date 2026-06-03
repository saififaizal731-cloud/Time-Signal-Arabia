import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const videoRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeDuration = 500; // 0.5s in milliseconds
    let animationFrameId;

    const handleVideoEnded = () => {
      setOpacity(0);
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 100);
    };

    const updateOpacity = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      const fadeOutStart = duration - (fadeDuration / 1000);

      if (currentTime < fadeDuration / 1000) {
        // Fade in at start
        const fadeInOpacity = currentTime / (fadeDuration / 1000);
        setOpacity(Math.min(fadeInOpacity, 1));
      } else if (currentTime >= fadeOutStart) {
        // Fade out at end
        const timeUntilEnd = duration - currentTime;
        const fadeOutOpacity = timeUntilEnd / (fadeDuration / 1000);
        setOpacity(Math.min(fadeOutOpacity, 1));
      } else {
        setOpacity(1);
      }

      animationFrameId = requestAnimationFrame(updateOpacity);
    };

    video.addEventListener('ended', handleVideoEnded);
    animationFrameId = requestAnimationFrame(updateOpacity);

    return () => {
      video.removeEventListener('ended', handleVideoEnded);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full object-cover"
        style={{
          top: '300px',
          opacity: opacity,
          transition: 'opacity 0.1s linear',
        }}
        autoPlay
        muted
        playsInline
        preload="metadata"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" style={{ zIndex: 5 }} />

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl tracking-tight font-serif text-foreground">
            TSA<sup className="text-sm">®</sup>
          </h1>
          <span className="text-sm font-sans font-semibold" style={{ color: '#0052cc' }}>Time Signal Arabia</span>
        </div>

        <div className="hidden md:flex items-center gap-8 border-b-2 border-gray-200 pb-0">
          <a href="#" className="text-sm text-foreground font-semibold pb-2 border-b-3 transition-colors" style={{ borderBottomColor: '#0052cc' }}>
            Home
          </a>
          <a href="#" className="text-sm text-muted pb-2 border-b-3 border-transparent transition-colors hover:text-foreground" style={{}}>
            Products
          </a>
          <a href="#" className="text-sm text-muted pb-2 border-b-3 border-transparent transition-colors hover:text-foreground" style={{}}>
            About
          </a>
          <a href="#" className="text-sm text-muted pb-2 border-b-3 border-transparent transition-colors hover:text-foreground" style={{}}>
            Contact
          </a>
        </div>

        <button className="rounded-full px-6 py-2.5 text-sm bg-foreground text-white hover:scale-103 transition-transform">
          Shop Now
        </button>
      </nav>

      {/* Hero Section */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40"
        style={{ paddingTop: 'calc(8rem - 75px)' }}
      >
        <h2
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl max-w-7xl font-serif font-normal text-foreground animate-fade-rise"
          style={{
            lineHeight: '0.95',
            letterSpacing: '-2.46px',
          }}
        >
          Welcome to <span className="text-muted italic">TSA</span> Time Signal Arabia
        </h2>

        <p
          className="text-2xl sm:text-3xl md:text-4xl max-w-2xl mt-8 leading-relaxed font-semibold animate-fade-rise-delay"
          style={{ animationDelay: '0.2s', color: '#0052cc' }}
        >
          Time Signal Arabia
        </p>

        <p
          className="text-sm text-muted mt-4 animate-fade-rise-delay-2"
          style={{ animationDelay: '0.4s' }}
        >
          📍 Qurban Street, Madinah, Saudi Arabia
        </p>

        <button
          className="rounded-full px-14 py-5 text-base bg-foreground text-white hover:scale-103 transition-transform mt-12 animate-fade-rise-delay-2 font-sans"
          style={{ animationDelay: '0.4s' }}
          onClick={() => {
            const section = document.getElementById('products');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
}
