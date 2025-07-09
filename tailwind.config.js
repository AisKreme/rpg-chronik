module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
      },
      colors: {
        parchment: '#fdf6e3',
        ink: '#1a1a1a',
      },
    },
  },
  plugins: [],
};