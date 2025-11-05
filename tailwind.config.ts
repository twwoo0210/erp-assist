/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {\n      fontFamily: {\n        sans: [\n          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',\n          'Helvetica', 'Arial', 'Apple SD Gothic Neo', 'Noto Sans KR',\n          'Malgun Gothic', 'sans-serif'\n        ]\n      }\n    },
    },
    plugins: [],
  }
