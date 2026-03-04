/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FFB800", // Hyundai H1 Yellow
                "surface-glass": "rgba(255, 255, 255, 0.60)",
                "surface-glass-hover": "rgba(255, 255, 255, 0.80)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                '3xl': '24px',
                '4xl': '32px',
                '5xl': '40px',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(5deg)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.7' },
                }
            },
            animation: {
                'wiggle': 'wiggle 2s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
