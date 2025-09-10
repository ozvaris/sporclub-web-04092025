/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx,html}"],
  theme: {
    extend: {
      colors: { primary: "#1e40af" },
      fontFamily: { sans: ["var(--font-inter)", "sans-serif"] },
    },
  },
  // v4'te plugin'leri burada DEĞİL, CSS'te @plugin ile çağırıyoruz.
};
