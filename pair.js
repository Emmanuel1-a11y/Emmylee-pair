// EMMYLEE - OWN PAIRING SERVER (Like your guy own)
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
  <html><body style="background:#111;color:white;text-align:center;font-family:sans-serif;padding:40px">
  <h1>🤖 EMMYLEE PAIRING</h1>
  <p>Enter your WhatsApp number to get your own pairing code</p>
  <form action="/pair" method="GET">
  <input name="number" placeholder="2348031234567" style="padding:12px;width:250px;font-size:16px" required />
  <br><br><button style="padding:12px 30px;background:#25D366;border:none;font-size:16px;border-radius:8px">GET CODE</button>
  </form>
  <p style="color:#aaa">One link, everybody fit use am. Each person go get him own code.</p>
  </body></html>
  `);
});

app.get('/pair', async (req, res) => {
  let num = req.query.number?.replace(/[^0-9]/g, '');
  if (!num) return res.send('Enter number! Go back.');
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false, browser: ['Emmylee', 'Chrome', '1.0'] });
  sock.ev.on('creds.update', saveCreds);
  try {
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(num);
    res.send(`
    <html><body style="background:#111;color:white;text-align:center;font-family:sans-serif;padding:40px">
    <h1>YOUR CODE</h1>
    <h1 style="font-size:50px;letter-spacing:5px;color:#25D366">${code}</h1>
    <p>Go to WhatsApp > Linked Devices > Link with phone number > Enter this code</p>
    <p style="color:orange">Code go expire in 30 sec. If e expire, refresh this page to get new one.</p>
    <a href="/" style="color:white">Get New Code</a>
    </body></html>
    `);
    setTimeout(() => { try{sock.end()}catch(e){} }, 35000);
  } catch(e) {
    res.send('Error: ' + e.message + ' <br><a href="/">Try again</a>');
  }
});

app.listen(3000, () => console.log('Emmylee Pairing Server dey run for http://localhost:3000'));
