// create an express app
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const nodemailer = require("nodemailer");
require('dotenv').config();

const app = express();

// use the express-static middleware
app.use(express.static("public"));

// BodyParser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const emailRgx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// define the first route
app.post("/send-email", function (req, res) {
   let {firstName, lastName, emailAddress, phoneNumber, subject, message} = req.body;

   // Check for the required values
   if (firstName.length === 0 || lastName.length === 0 || !emailRgx.test(emailAddress) || subject.length === 0 || message.length === 0) {
      res.status(400).json({
         message: "Wrong body parameters",
         code: 400
      });
   }
   else {
      // Prepare nodemailer send
      const output = `
      <p>
         <b>Od: </b>${firstName} ${lastName}
      </p>
      <p><b>Email: </b>${emailAddress}</p>
      <p><b>Telefon: </b>${phoneNumber.length > 0 ? phoneNumber : "-"}</p>
      <p><b>Temat: </b>${subject}</p>
      <br/>
      <p><b>Wiadomość: </b>${message}</p>
   `;

      let transporter = nodemailer.createTransport({
         service: "Hotmail",
         // host: "smtp.office365.com",
         // port: 587,
         // secure: false,
         auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS
         },
         // tls: {
         //   ciphers:'SSLv3',
         //   rejectUnauthorized: false,
         // }
      });

      // Local verifying (can be deleted)
      transporter.verify(function (error, success) {
         if (error) {
            console.log("Verify error:",error);
         } else {
            console.log("Server is ready to take our messages");
         }
      });

      let mailOptions = {
         from: emailAddress,
         to: "martinzz.info@gmail.com",
         subject: subject,
         html: output
      };

      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
            console.log("Error occurred!:", error);
            res.status(400).json({
               message: "Error occurred",
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
});

// start the server listening for requests
app.listen(process.env.PORT || 3001, // or just same 3001
   () => console.log("Server is running..."));