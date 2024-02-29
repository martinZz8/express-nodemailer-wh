// require packages
const express = require("express");
//const bodyParser = require("body-parser");
const multer = require('multer');
const cors = require('cors');
const nodemailer = require("nodemailer");
require('dotenv').config();

// Create an express object
const app = express();

// Create multer object (for file processing)
const upload = multer();

// Use the express-static middleware
app.use(express.static("public"));

// BodyParser middleware (deprecated - for json objects)
//app.use(bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());

// Use cors politics
app.use(cors());

// Import emailRgx
const {emailRgx} = require("./data/emailRgx");

// Import functions
const {getStrOrDash} = require("./functions/getStrOrDash");

// Define the first route
// 1) mandatory: subject, message
// 2) can be omitted: firstName, lastName
// 3) require one proper value of: emailAddress, phoneNumber
app.post("/send-email", upload.array("files"), function (req, res) {
   // "req.files" is array of uploaded files
   // "req.body" will contain the text fields, if there were any
   let {firstName, lastName, emailAddress, phoneNumber, subject, message} = req.body;
   //console.log(`firstName: ${firstName}, lastName: ${lastName}, emailAddress: ${emailAddress}, phoneNumber: ${phoneNumber}, subject: ${subject}, message: ${message}`)
   //console.log("req.files:", req.files);

   let canProceed = true;
   let proceedErrorItems = [];

   // Check for the required values
   if (subject.length === 0) {
      canProceed = false;
      proceedErrorItems.push("subject");
   }

   if (message.length === 0) {
      canProceed = false;
      proceedErrorItems.push("message");
   }

   // Check for the proper emailAddress, if it's given
   if (emailAddress.length > 0) {
      if (!emailRgx.test(emailAddress)) {
         canProceed = false;
         proceedErrorItems.push("emailAddress");
      }
   }

   // Check for the proper phoneNumber, if it's given (can't contain letters)
   if (phoneNumber.length > 0) {
      if (/[a-zA-Z]/.test(phoneNumber)) {
         canProceed = false;
         proceedErrorItems.push("phoneNumber");
      }
   }

   // Check if phoneNumber or emailAddress is given (one of them has to be given) (we use here the 'proceedErrorItems' array)
   if (
      (phoneNumber.length === 0 && emailAddress.length === 0)
      || proceedErrorItems.includes("phoneNumber")
      || proceedErrorItems.includes("emailAddress")
   ) {
      canProceed = false;
      proceedErrorItems.push("phoneNumber and emailAddress are blank or invalid - one of them has to be given properly");
   }

   // Check if we can send email
   if (canProceed) {
      // Prepare nodemailer send
      const output = `
      <p style="font-size: 15px"><b>-- Mail od strony www biura rachunkowego Wiesław Harbuz --</b></p>
      <br/>
      <p style="font-size: 13px; text-decoration: underline"><b>Dane autora</b></p>
      <p style="font-size: 12px"><b>Imię: </b>${getStrOrDash(firstName)}</p>
      <p style="font-size: 12px"><b>Nazwisko: </b>${getStrOrDash(lastName)}</p>
      <p style="font-size: 12px"><b>Email: </b>${getStrOrDash(emailAddress)}</p>
      <p style="font-size: 12px"><b>Telefon: </b>${getStrOrDash(phoneNumber)}</p>
      <br/>
      <p style="font-size: 13px; text-decoration: underline"><b>Treść</b></p>
      <p style="font-size: 12px"><b>Temat: </b>${subject}</p>
      <p style="font-size: 12px"><b>Wiadomość: </b>${message}</p>
      <br/>
      <p style="font-size: 13px; color: red"><b>Uwaga! Przycisk odpowiedzi powinien działać poprawnie.</b></p>
   `;

      // Create transporter
      let transporter = nodemailer.createTransport({
         // service: "Hotmail",
         // host: "smtp.office365.com",
         // port: 587,
         // secure: false,
         // auth: {
         //    user: process.env.AUTH_EMAIL,
         //    pass: process.env.AUTH_PASS
         // },
         // tls: {
         //   ciphers:'SSLv3',
         //   rejectUnauthorized: false,
         // }
         host: process.env.SMTP_HOST,
         port: process.env.SMTP_PORT,
         secure: false,
         auth: {
            user: process.env.SMTP_AUTH_EMAIL,
            pass: process.env.SMTP_AUTH_PASS
         },
      });

      //Local verifying (can be omitted)
      /*
      transporter.verify(function (error, success) {
         if (error) {
            console.log("Verify error:",error);
         } else {
            console.log("Server is ready to take our messages");
         }
      });
      */

      // Prepare mail options
      let mailOptions = {
         from: process.env.SMTP_FROM_EMAIL,
         to: process.env.SMTP_TO_EMAIL,
         replyTo: emailAddress,
         bcc: process.env.SMTP_BCC_EMAIL,
         subject: `Mailer biura rachunkowego WH: ${subject}`,
         html: output,
         attachments: req.files.map(item => ({
            filename: item.originalname,
            content: Buffer.from(item.buffer, "utf8") //'new Buffer(buf, encoding)' is deprecated in this node version
         }))
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
            console.log("Error occurred!:", error);
            res.status(400).json({
               message: "Error occurred during sending email to SMTP",
               code: 400
            });
         }
         else {
            // if we don't have error, it's send successfully
            console.log("Message send successfully!");
            res.status(200).json({
               message: "Message send successfully",
               code: 200
            });
         }

         //console.log("info:", info);
      });
   }
   else {
      res.status(400).json({
         message: "Wrong body parameters: " + proceedErrorItems.join(", "),
         code: 400
      });
   }
});

// Start the server listening for requests
app.listen(process.env.PORT || 3001, // or just same 3001
   () => console.log("Server is running..."));