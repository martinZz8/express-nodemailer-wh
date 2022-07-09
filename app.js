// create an express app
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const nodemailer = require("nodemailer");
const app = express();

// use the express-static middleware
app.use(express.static("public"));

// BodyParser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// define the first route
app.post("/send-email", function (req, res) {
   const output = `
      <p>
         <b>Od: </b>${req.body.firstName} ${req.body.lastName}
      </p>
      <p><b>Email: </b>${req.body.emailAddress}</p>
      <p><b>Telefon: </b>${req.body.phoneNumber.length > 0 ? req.body.phoneNumber : "-"}</p>
      <p><b>Temat: </b>${req.body.subject}</p>
      <br/>
      <p><b>Wiadomość: </b>${req.body.message}</p>
   `;

   let transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      secure: false,
      auth: {
         user: "martinzz.info@gmail.com",
         pass: "36255C8AC7FC5D336C70A2FC3BB580713963"
      }
   });

   let mailOptions = {
      from: req.body.emailAddress,
      to: "martinzz.info@gmail.com",
      subject: req.body.subject,
      html: output
   };

   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.log("Error occurred!");
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

      console.log("info:", info);
   });
});

// start the server listening for requests
app.listen(process.env.PORT || 3001, // or just same 3001
   () => console.log("Server is running..."));