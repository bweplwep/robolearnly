import React, { useEffect, useRef } from 'react';

export default function SimpleAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    console.log('SimpleAnimatedBackground: useEffect запущен');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }
    
    console.log('Canvas найден:', canvas);
    
    // Устанавливаем размер canvas равным размеру окна
    const resizeCanvas = () => {
      console.log('Resizing canvas to:', window.innerWidth, window.innerHeight);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available!');
      return;
    }
    
    console.log('Canvas context получен');
    
    // Простые частицы
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }> = [];
    
    // Создаем 30 частиц
    const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981'];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    console.log('Создано частиц:', particles.length);
    
    // Позиция мыши
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 100
    };
    
    // Обработчик движения мыши
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    
    // Функция анимации
    const animate = () => {
      // Очищаем canvas полностью
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Обновляем и рисуем частицы
      particles.forEach(particle => {
        // Движение
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Отскок от границ
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        // Взаимодействие с мышью
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - distance) / mouse.radius;
          particle.x -= Math.cos(angle) * force * 2;
          particle.y -= Math.sin(angle) * force * 2;
        }
        
        // Рисуем частицу
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Свечение
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}40`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      // Рисуем соединения между частицами
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = 1 - (distance / 100);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Запускаем следующий кадр
      animationRef.current = requestAnimationFrame(animate);
    };
    
    console.log('Запуск анимации...');
    animate();
    
    // Очистка
    return () => {
      console.log('Очистка анимации');
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}