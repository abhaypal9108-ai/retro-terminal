import { useEffect, useRef } from 'react';

export default function MatrixRain({ onExit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Resize to fill screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Characters: Katakana, numbers, and Latin
    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // Track y position for every column
    const drops = Array(columns).fill(1);

    const draw = () => {
      // Semi-transparent black background creates the trailing fading effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41'; // Vibrant matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly once it hits the bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'q') {
        onExit();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  return (
    <div
      onClick={onExit}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        cursor: 'pointer',
        background: '#000'
      }}
      title="Click or press ESC to exit"
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          color: '#33ff33',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          opacity: 0.7
        }}
      >
        [PRESS ESC OR CLICK TO EXIT MATRIX]
      </div>
    </div>
  );
}