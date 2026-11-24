/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    950: '#0f0d0a',
                    900: '#14110d',
                    800: '#1c1813',
                    700: '#262019',
                    600: '#332a1f',
                },
                ember: {
                    300: '#f0b878',
                    400: '#e8892f',
                    500: '#d97e2b',
                    600: '#bf6a22',
                },
                cream: {
                    100: '#f4efe3',
                    300: '#d8d0bd',
                    500: '#a89d89',
                }
            },
            fontFamily: {
                sans: ['Figtree', 'system-ui', 'sans-serif'],
                serif: ['Bodoni Moda', 'Didot', 'Georgia', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'typing': 'typing 1.2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                typing: {
                    '0%, 100%': { opacity: '0.3' },
                    '50%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
