const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer Transporter konfigurieren
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'finn.arnold.lol.cool@gmail.com',
    pass: 'uiqg nval egpv pjiy' // Verwenden Sie hier das App-spezifische Passwort
  }
});

// Route zum Empfangen von Bestellungen
app.post('/submit-order', (req, res) => {
  const orderData = req.body;

  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der Datei:', err);
      return res.status(500).send('Fehler beim Lesen der Datenbank.');
    }

    let orders;
    try {
      orders = JSON.parse(data);
    } catch (parseErr) {
      console.error('Fehler beim Parsen der JSON-Daten:', parseErr);
      return res.status(500).send('Fehler beim Verarbeiten der Datenbank.');
    }

    orders.orders.push(orderData);

    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        console.error('Fehler beim Schreiben in die Datei:', err);
        return res.status(500).send('Fehler beim Speichern der Bestellung.');
      }

      // E-Mail senden
      let mailOptions = {
        from: 'your-email@gmail.com',
        to: orderData.email,
        subject: 'Bestellbestätigung',
        text: `Vielen Dank für Ihre Bestellung. Die Gesamtsumme beträgt ${orderData.totalPrice}€. Bitte überweisen Sie den Betrag an die angegebene IBAN.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Fehler beim Senden der E-Mail:', error);
          return res.status(500).send('Fehler beim Senden der E-Mail.');
        } else {
          console.log('E-Mail gesendet:', info.response);
          res.send('Bestellung erfolgreich gespeichert und E-Mail gesendet!');
        }
      });
    });
  });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});