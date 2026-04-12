import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SHAPES = ['aperture', 'frame', 'flash', 'plus', 'circle', 'camera'] as const;

interface FloatingItem {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    shape: typeof SHAPES[number];
    depth: number; // 0 to 1, where 1 is closer (moves faster)
}

const renderShape = (shape: string, size: number) => {
    const strokeWidth = size * 0.08;

    switch (shape) {
        case 'camera':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            );
        case 'aperture':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
                </svg>
            );
        case 'frame':
            return (
                <div className="w-full h-full relative">
                    <div className="absolute top-0 left-0 w-1/3 h-1/3 border-t border-l border-current bg-current/10" style={{ borderWidth: strokeWidth + 'px 0 0 ' + strokeWidth + 'px' }} />
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 border-t border-r border-current bg-current/10" style={{ borderWidth: strokeWidth + 'px ' + strokeWidth + 'px 0 0' }} />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 border-b border-l border-current bg-current/10" style={{ borderWidth: '0 0 ' + strokeWidth + 'px ' + strokeWidth + 'px' }} />
                    <div className="absolute bottom-0 right-0 w-1/3 h-1/3 border-b border-r border-current bg-current/10" style={{ borderWidth: '0 ' + strokeWidth + 'px ' + strokeWidth + 'px 0' }} />
                </div>
            );
        case 'flash':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            );
        case 'circle':
            return (
                <div
                    className="w-full h-full rounded-full border border-current opacity-60"
                    style={{ borderWidth: strokeWidth }}
                />
            );
        case 'plus':
            return (
                <div className="relative w-full h-full rotate-45 opacity-60">
                    <div className="absolute top-1/2 left-0 w-full bg-current -translate-y-1/2" style={{ height: strokeWidth }} />
                    <div className="absolute top-0 left-1/2 h-full bg-current -translate-x-1/2" style={{ width: strokeWidth }} />
                </div>
            );
        default:
            return null;
    }
};

const FloatingShape = ({ item, mouseX, mouseY }: { item: FloatingItem, mouseX: any, mouseY: any }) => {
    // Parallax effect: moves opposite to mouse, scaling with depth
    const x = useTransform(mouseX, (val: number) => val * item.depth * 150 * -1);
    const y = useTransform(mouseY, (val: number) => val * item.depth * 150 * -1);

    return (
        <motion.div
            className="absolute text-charcoal/40"
            style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                x,
                y,
                width: item.size,
                height: item.size,
            }}
        >
            <motion.div
                className="w-full h-full"
                animate={{
                    rotate: [0, 360],
                    x: [0, item.size * 0.5, 0, -item.size * 0.5, 0],
                    y: [0, -item.size * 0.5, 0, item.size * 0.5, 0],
                }}
                transition={{
                    duration: 10 + item.depth * 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {renderShape(item.shape, item.size)}
            </motion.div>
        </motion.div>
    );
};

const GravityBackground: React.FC = () => {
    const [items, setItems] = useState<FloatingItem[]>([]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out mouse movements with better spring settings
    const smoothX = useSpring(mouseX, { stiffness: 30, damping: 15, mass: 1 });
    const smoothY = useSpring(mouseY, { stiffness: 30, damping: 15, mass: 1 });

    useEffect(() => {
        const newItems: FloatingItem[] = Array.from({ length: 18 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 25 + 15,
            rotation: Math.random() * 360,
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            depth: Math.random() * 0.4 + 0.1,
        }));
        setItems(newItems);

        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                mouseX.set((e.clientX / window.innerWidth) - 0.5);
                mouseY.set((e.clientY / window.innerHeight) - 0.5);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
            {items.map((item) => (
                <FloatingShape
                    key={item.id}
                    item={item}
                    mouseX={smoothX}
                    mouseY={smoothY}
                />
            ))}
        </div>
    );
};

export default GravityBackground;
