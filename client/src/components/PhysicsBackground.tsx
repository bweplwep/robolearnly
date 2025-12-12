import React, { useEffect, useRef } from 'react';

interface Wave {
    x: number;
    y: number;
    amplitude: number;
    frequency: number;
    speed: number;
    color: string;
}

interface Formula {
    x: number;
    y: number;
    text: string;
    size: number;
    speedX: number;
    speedY: number;
    rotation: number;
    color: string;
}

export default function PhysicsBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();

        // Физические формулы
        const formulas: Formula[] = [
            // Механика
            { x: 100, y: 100, text: 'F = m·a', size: 24, speedX: 0.1, speedY: 0.05, rotation: 0, color: '#3b82f6' },
            { x: 300, y: 200, text: 'E = mc²', size: 28, speedX: -0.08, speedY: 0.06, rotation: 0, color: '#06b6d4' },
            { x: 500, y: 150, text: 'p = m·v', size: 22, speedX: 0.12, speedY: -0.04, rotation: 0, color: '#8b5cf6' },
            { x: 700, y: 250, text: 'W = F·s', size: 26, speedX: -0.09, speedY: 0.07, rotation: 0, color: '#10b981' },

            // Электричество
            { x: 150, y: 350, text: 'U = I·R', size: 24, speedX: 0.11, speedY: 0.03, rotation: 0, color: '#f59e0b' },
            { x: 400, y: 400, text: 'P = U·I', size: 26, speedX: -0.07, speedY: 0.09, rotation: 0, color: '#ef4444' },
            { x: 650, y: 320, text: 'F = k·q₁q₂/r²', size: 20, speedX: 0.08, speedY: -0.05, rotation: 0, color: '#ec4899' },

            // Волны и оптика
            { x: 200, y: 500, text: 'λ = v/f', size: 24, speedX: -0.1, speedY: 0.04, rotation: 0, color: '#6366f1' },
            { x: 450, y: 550, text: 'n = c/v', size: 26, speedX: 0.09, speedY: -0.06, rotation: 0, color: '#14b8a6' },
            { x: 750, y: 480, text: 'E = h·f', size: 28, speedX: -0.12, speedY: 0.08, rotation: 0, color: '#f97316' },
        ];

        // Волны
        const waves: Wave[] = [
            { x: 0, y: canvas.height / 3, amplitude: 35, frequency: 0.015, speed: 0.015, color: '#3b82f6' },
            { x: 0, y: canvas.height / 2, amplitude: 40, frequency: 0.02, speed: 0.02, color: '#06b6d4' },
            { x: 0, y: canvas.height * 2 / 3, amplitude: 30, frequency: 0.025, speed: 0.025, color: '#8b5cf6' },
        ];

        // Частицы (электроны, фотоны и т.д.)
        const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            type: 'electron' | 'photon' | 'proton';
        }> = [];

        // Создаем частицы
        for (let i = 0; i < 25; i++) {
            const types = ['electron', 'photon', 'proton'] as const;
            const type = types[Math.floor(Math.random() * types.length)];
            let color = '#60a5fa';
            let size = 3;

            switch (type) {
                case 'electron': color = '#60a5fa'; size = 3; break;
                case 'photon': color = '#fbbf24'; size = 4; break;
                case 'proton': color = '#ef4444'; size = 5; break;
            }

            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                color,
                type
            });
        }

        // Обработчик мыши
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        // Рисуем формулу
        const drawFormula = (formula: Formula) => {
            ctx.save();
            ctx.translate(formula.x, formula.y);
            ctx.rotate(formula.rotation);

            // Фон формулы
            ctx.fillStyle = `${formula.color}15`;
            ctx.fillRect(-formula.text.length * formula.size / 4, -formula.size / 2,
                formula.text.length * formula.size / 2, formula.size * 1.5);

            // Текст формулы
            ctx.font = `bold ${formula.size}px 'Cambria Math', 'Times New Roman', serif`;
            ctx.fillStyle = formula.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(formula.text, 0, 0);

            // Свечение
            ctx.shadowBlur = 20;
            ctx.shadowColor = formula.color;
            ctx.fillText(formula.text, 0, 0);
            ctx.shadowBlur = 0;

            ctx.restore();
        };

        // Рисуем волну
        const drawWave = (wave: Wave, time: number) => {
            ctx.beginPath();
            ctx.moveTo(0, wave.y);

            for (let x = 0; x < canvas.width; x++) {
                // Синусоидальная волна с затуханием
                const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;

                // Добавляем гармоники для сложной волны
                const y2 = Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.3);

                if (x === 0) {
                    ctx.moveTo(x, y + y2);
                } else {
                    ctx.lineTo(x, y + y2);
                }
            }

            // Градиент для волны
            const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude);
            gradient.addColorStop(0, `${wave.color}00`);
            gradient.addColorStop(0.3, `${wave.color}30`);
            gradient.addColorStop(0.7, `${wave.color}30`);
            gradient.addColorStop(1, `${wave.color}00`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        // Рисуем частицу
        const drawParticle = (particle: any) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

            // Градиент для частицы
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `${particle.color}80`);
            gradient.addColorStop(1, `${particle.color}00`);

            ctx.fillStyle = gradient;
            ctx.fill();

            // Орбита для электронов
            if (particle.type === 'electron') {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
                ctx.strokeStyle = `${particle.color}15`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        };

        // Анимация
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Темный градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0.97)');
            gradient.addColorStop(1, 'rgba(30, 41, 59, 0.97)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() * 0.001;

            // Рисуем волны
            waves.forEach(wave => {
                drawWave(wave, time);
            });

            // Обновляем и рисуем формулы
            formulas.forEach(formula => {
                // Движение
                formula.x += formula.speedX;
                formula.y += formula.speedY;
                formula.rotation += 0.001;

                // Отскок от границ
                if (formula.x < 50 || formula.x > canvas.width - 50) formula.speedX *= -1;
                if (formula.y < 50 || formula.y > canvas.height - 50) formula.speedY *= -1;

                // Ограничение
                formula.x = Math.max(50, Math.min(canvas.width - 50, formula.x));
                formula.y = Math.max(50, Math.min(canvas.height - 50, formula.y));

                // Взаимодействие с мышью
                const dx = mouseRef.current.x - formula.x;
                const dy = mouseRef.current.y - formula.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const force = (120 - distance) / 120;
                    const angle = Math.atan2(dy, dx);
                    formula.x -= Math.cos(angle) * force * 4;
                    formula.y -= Math.sin(angle) * force * 4;
                }

                drawFormula(formula);
            });

            // Обновляем и рисуем частицы
            particles.forEach(particle => {
                // Движение
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Отскок от границ
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                // Взаимодействие с мышью
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    const angle = Math.atan2(dy, dx);

                    if (particle.type === 'electron') {
                        // Электроны отталкиваются от мыши
                        particle.x -= Math.cos(angle) * force * 3;
                        particle.y -= Math.sin(angle) * force * 3;
                    } else if (particle.type === 'proton') {
                        // Протоны притягиваются к мыши
                        particle.x += Math.cos(angle) * force * 2;
                        particle.y += Math.sin(angle) * force * 2;
                    }
                }

                drawParticle(particle);
            });

            // Рисуем силовые линии между частицами
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
            ctx.lineWidth = 1;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particles[i].x;
                    const dy = particles[j].y - particles[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        // Разный тип взаимодействия для разных частиц
                        let opacity = 0.1;
                        let color = '#3b82f6';

                        if (particles[i].type === 'electron' && particles[j].type === 'proton') {
                            opacity = 0.3;
                            color = '#ef4444';
                        } else if (particles[i].type === particles[j].type) {
                            opacity = 0.15;
                            color = particles[i].color;
                        }

                        ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                        ctx.setLineDash([2, 4]);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            }

            // Рисуем сетку координат (как в тетради по физике)
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
            ctx.lineWidth = 0.5;

            // Горизонтальные линии
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Вертикальные линии
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', resizeCanvas);

        return () => {
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