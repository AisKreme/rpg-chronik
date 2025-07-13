module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['EB Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
        dunkel: ['Dunkel', 'serif'],
        magisch: ['Magisch', 'serif'],
        verzaubert: ['Verzaubert', 'cursive'],
      },
      colors: {
        parchment: '#fdf6e3',
        ink: '#1a1a1a',
      },
    },
  },
  plugins: [],
  extend: {
  animation: {
    'holo-glow': 'holo 3s ease-in-out infinite',
  },
  keyframes: {
    holo: {
      '0%, 100%': { textShadow: '0 0 2px #fff, 0 0 10px #0ff, 0 0 5px #0ff' },
      '50%': { textShadow: '0 0 4px #fff, 0 0 14px #0ff, 0 0 8px #0ff' },
    },
  }
}
};