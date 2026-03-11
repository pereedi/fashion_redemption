/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#FFFFFF",
                black: "#0B0B0B",
                white: "#FFFFFF",
                "luxury-red": "#C1121F",
                "light-gray": "#F5F5F5",
                "dark-navy": "#0D1B2A",
            },
            fontFamily: {
                serif: ["'Playfair Display'", "serif"],
                sans: ["'Inter'", "sans-serif"],
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
