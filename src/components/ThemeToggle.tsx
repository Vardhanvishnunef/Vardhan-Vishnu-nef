import React from 'react';
import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-charcoal/10 shadow-lifted hover:scale-110 transition-transform group dark:border-white/20 dark:bg-black/20"
            aria-label="Toggle Theme"
        >
            {/* Modern Animated SVG Icon */}
            <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-charcoal dark:text-limestone"
                animate={theme === 'dark' ? "dark" : "light"}
            >
                {/* Main Circle (Sun Body / Moon) */}
                <motion.circle
                    cx="12"
                    cy="12"
                    r="5"
                    fill="currentColor"
                    variants={{
                        light: { scale: 1 },
                        dark: { scale: 1 }
                    }}
                    transition={{ duration: 0.5 }}
                    mask="url(#moon-mask)"
                />

                {/* Sun Rays (Fade out in Dark mode) */}
                <motion.g
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    variants={{
                        light: { opacity: 1, rotate: 0, scale: 1 },
                        dark: { opacity: 0, rotate: 45, scale: 0.5 }
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <path d="M12 2V4" />
                    <path d="M12 20V22" />
                    <path d="M4.22 4.22L5.64 5.64" />
                    <path d="M18.36 18.36L19.78 19.78" />
                    <path d="M2 12H4" />
                    <path d="M20 12H22" />
                    <path d="M4.22 19.78L5.64 18.36" />
                    <path d="M18.36 5.64L19.78 4.22" />
                </motion.g>

                {/* Mask to create the Crescent Moon shape */}
                <mask id="moon-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <motion.circle
                        cx="12"
                        cy="12"
                        r="5"
                        fill="black"
                        variants={{
                            light: { cx: 24, cy: 0 }, // Mask moved away (Full Sun)
                            dark: { cx: 16, cy: 8 }   // Mask overlaps (Crescent)
                        }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                    />
                </mask>
            </motion.svg>
        </button>
    );
};

export default ThemeToggle;
