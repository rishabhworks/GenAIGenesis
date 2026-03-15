import { useEffect, useRef } from 'react';

export default function AppEffects() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  // ——— CURSOR ———
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    let cx = 0, cy = 0;
    let dx = 0, dy = 0;

    const onMove = (e) => {
      dx = e.clientX;
      dy = e.clientY;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      dot.style.left = dx + 'px';
      dot.style.top  = dy + 'px';
    };

    const animate = () => {
      cx += (dx - cx) * 0.12;
      cy += (dy - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animate();

    // Grow on hover over interactive elements
    const onEnter = () => cursor.classList.add('cursor--hover');
    const onLeave = () => cursor.classList.remove('cursor--hover');
    document.querySelectorAll('button, a, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ——— PARTICLES ———
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const PARTICLE_COUNT = 80;
    const MAX_DIST = 140;
    const TEAL   = '26, 122, 138';
    const GOLD   = '196, 146, 42';

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 1.8 + 0.6;
        this.color = Math.random() > 0.7 ? GOLD : TEAL;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, 0.7)`;
        ctx.fill();
      }
    }

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    const drawLines = (p1, p2, dist) => {
      const op = (1 - dist / MAX_DIST) * 0.35;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(${p1.color}, ${op})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    };

    const drawMouseLines = (p) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dist = Math.hypot(p.x - mx, p.y - my);
      if (dist < MAX_DIST * 1.5) {
        const op = (1 - dist / (MAX_DIST * 1.5)) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(${TEAL}, ${op})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const ps = particlesRef.current;

      for (let i = 0; i < ps.length; i++) {
        ps[i].update();
        ps[i].draw();
        drawMouseLines(ps[i]);
        for (let j = i + 1; j < ps.length; j++) {
          const dist = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
          if (dist < MAX_DIST) drawLines(ps[i], ps[j], dist);
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.55,
        }}
      />

      {/* Cursor glow ring */}
      <div ref={cursorRef} className="cursor-ring" />

      {/* Cursor dot */}
      <div ref={cursorDotRef} className="cursor-dot" />
    </>
  );
}