/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "selector",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
                "dancing-script": ["Dancing Script", "cursive"],
                roboto: ["Roboto", "sans-serif"],
            },
            height: {
                spanHeight: "2px",
            },
            wordBreak: {
                "break-all": "break-all",
                "break-word": "break-word",
            },
        },
    },
    plugins: [],
};
