const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // <- CORS habilitado

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mati.durand98@gmail.com",
    pass: "biua rprk guzg qzqv",
  },
});

exports.sendVerificationEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Método no permitido');
    }

    const { email, emailCode } = req.body;

    const mailOptions = {
      from: "Matías Durand <mati.durand98@gmail.com>",
      to: email,
      subject: "Código de verificación de firma",
      text: `Tu código de verificación es: ${emailCode}`,
      html: `<p>Tu código de verificación es: <b>${emailCode}</b></p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).send({ success: true });
    } catch (error) {
      console.error("❌ Error al enviar correo:", error);
      return res.status(500).send({ error: "Fallo al enviar el correo" });
    }
  });
});
