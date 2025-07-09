import '../styles/globals.css';
import 'turn.js/lib/turn.min.css' // wenn das Paket CSS mitbringt
import 'turn.js/lib/turn.min.js'  // sorgt für globale Verfügbarkeit (Achtung: ggf. via CDN nötig)

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
