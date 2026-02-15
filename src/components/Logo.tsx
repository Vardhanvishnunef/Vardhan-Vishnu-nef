import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    variant?: 'light' | 'dark' | 'auto';
    interactive?: boolean;
    highContrast?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", variant = 'auto', interactive = false, highContrast = false }) => {
    // Strategies:
    // SVG Filter Strategy (Robust):
    // 1. Image has filter: url(#luma-alpha) contrast(1.5). This turns Black->Transparent, White->Opaque.
    // 2. Parent has filter: invert() (or not). This flips the White Opaque text to Black Opaque text if needed.
    // This separation prevents CSS 'filter' property conflicts (where one overwrites the other).

    const filterId = "luma-alpha";

    // Parent classes handle the Theme/Color
    const getParentClass = () => {
        const base = interactive ? 'transition-all duration-300' : '';
        switch (variant) {
            case 'light': return `${base} invert opacity-90`; // Invert White->Black
            case 'dark': return `${base} opacity-90`; // Keep White
            case 'auto': return `${base} invert dark:invert-0 opacity-90 dark:opacity-100`;
            default: return `${base} invert opacity-90`;
        }
    };

    const ref = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || !ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25; // Sensitivity
        const y = (e.clientY - top - height / 2) / 25;
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            className={`relative ${className} flex items-center justify-center select-none ${getParentClass()}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={interactive ? {
                x: mousePosition.x,
                y: mousePosition.y,
                rotateX: -mousePosition.y, // Tilt effect
                rotateY: mousePosition.x,
            } : {}}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            style={{ perspective: 1000 }}
            whileHover={interactive ? { scale: 1.05 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
        >
            {/* 
                SVG Filter Definition 
                Converts Luminance (R+G+B) to Alpha. 
                Input: White (1,1,1) -> Alpha 1.
                Input: Black (0,0,0) -> Alpha 0.
            */}
            <svg width="0" height="0" className="absolute hidden">
                <filter id={filterId} colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1
                                0 0 0 0 1
                                0 0 0 0 1
                                1 0 0 0 0"
                    />
                </filter>
            </svg>

            <img
                src="/images/logo.webp"
                alt="Vardhan Vishnu Photography"
                className="w-full h-full object-contain"
                style={{
                    // Apply ONLY the texture removal filter here.
                    // Color inversion is handled by parent.
                    filter: `url(#${filterId}) contrast(1.5)`
                }}
            />
        </motion.div>
    );
};

export default Logo;
