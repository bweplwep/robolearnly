import React, { useEffect, useRef } from 'react';

interface BinaryStream {
    x: number;
    y: number;
    speed: number;
    bits: string[];
    color: string;
}

interface CircuitElement {
    x: number;
    y: number;
    size: number;
    type: 'gate' | 'memory' | 'processor' | 'node';
    rotation: number;
    speedX: number;
    speedY: number;
    color: string;
}

export default function ProgrammingBackground() {
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

        // Потоки бинарного кода (как в "Матрице")
        const binaryStreams: BinaryStream[] = [];
        const streamColors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

        for (let i = 0; i < 8; i++) {
            binaryStreams.push({
                x: Math.random() * canvas.width,
                y: 0,
                speed: 1 + Math.random() * 2,
                bits: Array(20).fill(0).map(() => Math.random() > 0.5 ? '1' : '0'),
                color: streamColors[Math.floor(Math.random() * streamColors.length)]
            });
        }

        // Элементы схем (логические элементы, процессоры и т.д.)
        const circuitElements: CircuitElement[] = [];
        const elementTypes = ['gate', 'memory', 'processor', 'node'] as const;

        for (let i = 0; i < 15; i++) {
            const type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
            let color = '#10b981';
            let size = 25;

            switch (type) {
                case 'gate': color = '#10b981'; size = 30; break;
                case 'memory': color = '#06b6d4'; size = 35; break;
                case 'processor': color = '#8b5cf6'; size = 40; break;
                case 'node': color = '#f59e0b'; size = 20; break;
            }

            circuitElements.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size,
                type,
                rotation: 0,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                color
            });
        }

        // Код программы (плавающие фрагменты кода)
        const codeSnippets = [
            'function solve() {',
            'const result = [];',
            'for (let i = 0; i < n; i++) {',
            'if (condition) {',
            'return true;',
            '} else {',
            'continue;',
            '}',
            '}',
            'class Robot {',
            'constructor() {',
            'this.sensors = [];',
            '}',
            'move() {',
            'asabin',
            '}',
            '}',
            'def algorithm():',
            'while True:',
            'process_data()',
            'async def main():',
            'await task()',
            'public void run() {',
            'System.out.println();',
            '}'
        ];

        const floatingCode: Array<{
            x: number;
            y: number;
            text: string;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            color: string;
        }> = [];

        for (let i = 0; i < 12; i++) {
            floatingCode.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
                size: 12 + Math.random() * 6,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: 0.3 + Math.random() * 0.4,
                color: `rgba(${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 200 + 55)}, 250, 0.7)`
            });
        }

        // Обработчик мыши
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        // Рисуем бинарный поток
        const drawBinaryStream = (stream: BinaryStream) => {
            ctx.save();

            // Градиент для потока
            const gradient = ctx.createLinearGradient(
                stream.x, stream.y,
                stream.x, stream.y + stream.bits.length * 20
            );
            gradient.addColorStop(0, `${stream.color}00`);
            gradient.addColorStop(0.2, stream.color);
            gradient.addColorStop(0.8, stream.color);
            gradient.addColorStop(1, `${stream.color}00`);

            ctx.fillStyle = gradient;
            ctx.font = `bold 16px 'Courier New', monospace`;
            ctx.textAlign = 'center';

            // Рисуем биты
            stream.bits.forEach((bit, index) => {
                const y = stream.y + index * 20;

                // Случайное мерцание некоторых битов
                const shouldGlow = Math.random() > 0.7;

                if (shouldGlow) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = stream.color;
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = stream.color;
                }

                ctx.fillText(bit, stream.x, y);
            });

            ctx.restore();
        };

        // Рисуем элемент схемы
        const drawCircuitElement = (element: CircuitElement) => {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate(element.rotation);

            // Основная форма элемента
            ctx.beginPath();

            switch (element.type) {
                case 'gate':
                    // Логический элемент (AND/OR/NOT гейт)
                    ctx.moveTo(-element.size / 2, -element.size / 2);
                    ctx.lineTo(element.size / 2, 0);
                    ctx.lineTo(-element.size / 2, element.size / 2);
                    ctx.closePath();
                    break;

                case 'memory':
                    // Память (прямоугольник)
                    ctx.rect(-element.size / 2, -element.size / 2, element.size, element.size);
                    break;

                case 'processor':
                    // Процессор (шестиугольник)
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * 2 * Math.PI) / 6;
                        const x = Math.cos(angle) * element.size / 2;
                        const y = Math.sin(angle) * element.size / 2;

                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    break;

                case 'node':
                    // Узел (круг)
                    ctx.arc(0, 0, element.size / 2, 0, Math.PI * 2);
                    break;
            }

            // Заливка элемента
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, element.size);
            gradient.addColorStop(0, `${element.color}60`);
            gradient.addColorStop(1, `${element.color}20`);

            ctx.fillStyle = gradient;
            ctx.fill();

            // Обводка
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Символ внутри элемента
            ctx.font = `${element.size / 3}px Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let symbol = '';
            switch (element.type) {
                case 'gate': symbol = '&'; break;
                case 'memory': symbol = 'M'; break;
                case 'processor': symbol = 'CPU'; break;
                case 'node': symbol = '•'; break;
            }

            ctx.fillText(symbol, 0, 0);

            ctx.restore();
        };

        // Рисуем плавающий код
        const drawFloatingCode = (code: typeof floatingCode[0]) => {
            ctx.save();

            ctx.font = `${code.size}px 'Monaco', 'Courier New', monospace`;
            ctx.fillStyle = code.color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.globalAlpha = code.opacity;

            ctx.fillText(code.text, code.x, code.y);

            // Легкое свечение
            ctx.shadowBlur = 8;
            ctx.shadowColor = code.color;
            ctx.fillText(code.text, code.x, code.y);
            ctx.shadowBlur = 0;

            ctx.restore();
        };

        // Анимация
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Темный фон с текстурой
            ctx.fillStyle = 'rgba(15, 23, 42, 0.98)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Текстура микрочипов на заднем плане (очень прозрачная)
            ctx.fillStyle = 'rgba(59, 130, 246, 0.02)';
            for (let x = 0; x < canvas.width; x += 80) {
                for (let y = 0; y < canvas.height; y += 80) {
                    ctx.fillRect(x, y, 2, 2);
                    ctx.fillRect(x + 20, y + 20, 2, 2);
                    ctx.fillRect(x + 40, y, 2, 2);
                    ctx.fillRect(x + 60, y + 20, 2, 2);
                }
            }

            // Обновляем и рисуем бинарные потоки
            binaryStreams.forEach(stream => {
                // Движение вниз
                stream.y += stream.speed;

                // Если поток ушел за нижнюю границу, возвращаем наверх
                if (stream.y > canvas.height) {
                    stream.y = -stream.bits.length * 20;
                    stream.x = Math.random() * canvas.width;

                    // Обновляем биты
                    stream.bits = Array(20).fill(0).map(() => Math.random() > 0.5 ? '1' : '0');
                }

                drawBinaryStream(stream);
            });

            // Обновляем и рисуем элементы схем
            circuitElements.forEach(element => {
                // Движение
                element.x += element.speedX;
                element.y += element.speedY;
                element.rotation += 0.005;

                // Отскок от границ
                if (element.x < element.size || element.x > canvas.width - element.size) {
                    element.speedX *= -1;
                }
                if (element.y < element.size || element.y > canvas.height - element.size) {
                    element.speedY *= -1;
                }

                // Взаимодействие с мышью
                const dx = mouseRef.current.x - element.x;
                const dy = mouseRef.current.y - element.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    const angle = Math.atan2(dy, dx);

                    // Элементы отталкиваются от мыши
                    element.x -= Math.cos(angle) * force * 5;
                    element.y -= Math.sin(angle) * force * 5;
                }

                drawCircuitElement(element);
            });

            // Обновляем и рисуем плавающий код
            floatingCode.forEach(code => {
                // Движение
                code.x += code.speedX;
                code.y += code.speedY;

                // Медленное изменение прозрачности
                code.opacity = 0.3 + Math.sin(Date.now() * 0.001 + code.x * 0.01) * 0.3;

                // Отскок от границ
                if (code.x < 0 || code.x > canvas.width) code.speedX *= -1;
                if (code.y < 0 || code.y > canvas.height) code.speedY *= -1;

                drawFloatingCode(code);
            });

            // Рисуем соединения между элементами схем (как провода)
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);

            for (let i = 0; i < circuitElements.length; i++) {
                for (let j = i + 1; j < circuitElements.length; j++) {
                    const dx = circuitElements[j].x - circuitElements[i].x;
                    const dy = circuitElements[j].y - circuitElements[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        // Разный цвет соединений для разных типов элементов
                        let color = 'rgba(16, 185, 129, 0.15)';

                        if (circuitElements[i].type === 'processor' || circuitElements[j].type === 'processor') {
                            color = 'rgba(139, 92, 246, 0.2)';
                        } else if (circuitElements[i].type === 'memory' || circuitElements[j].type === 'memory') {
                            color = 'rgba(6, 182, 212, 0.2)';
                        }

                        const opacity = 1 - (distance / 200);
                        ctx.strokeStyle = color.replace('0.2', opacity.toString());

                        ctx.beginPath();
                        ctx.moveTo(circuitElements[i].x, circuitElements[i].y);
                        ctx.lineTo(circuitElements[j].x, circuitElements[j].y);
                        ctx.stroke();
                    }
                }
            }

            ctx.setLineDash([]);

            // Рисуем сетку (как на печатной плате)
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
            ctx.lineWidth = 0.5;

            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
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