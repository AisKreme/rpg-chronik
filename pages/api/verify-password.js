export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    const correct = process.env.CHRONIK_PASSWORT;
    const success = password === correct;
    res.status(200).json({ success });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}