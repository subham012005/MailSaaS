import { useRef, useEffect, useState } from 'react';

interface SquaresProps {
    direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right';
    speed?: number;
    borderColor?: string;
    hoverFillColor?: string;
    squareSize?: number;
    displacement?: number;
}

const Squares: React.FC<SquaresProps> = ({
    direction = 'diagonal',
    speed = 1,
    borderColor = 'rgba(255, 255, 255, 0.05)',
    hoverFillColor = 'rgba(255, 255, 255, 0.03)',
    squareSize = 40,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 0.5;

            const cols = Math.ceil(canvas.width / squareSize) + 2;
            const rows = Math.ceil(canvas.height / squareSize) + 2;

            offset = (offset + speed) % squareSize;

            for (let i = -1; i < cols; i++) {
                for (let j = -1; j < rows; j++) {
                    let x = i * squareSize;
                    let y = j * squareSize;

                    if (direction === 'diagonal') {
                        x += offset;
                        y += offset;
                    } else if (direction === 'right') {
                        x += offset;
                    } else if (direction === 'left') {
                        x -= offset;
                    } else if (direction === 'down') {
                        y += offset;
                    } else if (direction === 'up') {
                        y -= offset;
                    }

                    ctx.strokeRect(x, y, squareSize, squareSize);

                    if (hoverPos) {
                        const centerX = x + squareSize / 2;
                        const centerY = y + squareSize / 2;
                        const dist = Math.sqrt((centerX - hoverPos.x) ** 2 + (centerY - hoverPos.y) ** 2);
                        if (dist < squareSize * 2) {
                            ctx.fillStyle = hoverFillColor;
                            ctx.fillRect(x, y, squareSize, squareSize);
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [direction, speed, borderColor, hoverFillColor, squareSize, hoverPos]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            onMouseMove={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverPos(null)}
            style={{ zIndex: -1 }}
        />
    );
};

export default Squares;
