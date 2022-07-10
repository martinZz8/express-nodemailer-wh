1. To start this api type: 'node app.js'.

2. If you clone this project, be sure to create the .env file in the origin folder of the project.
It has to contain these values:
- SMTP_HOST (url of the hosting SMTP server)
- SMTP_PORT (port of the server)
- SMTP_AUTH_EMAIL (authentication email to SMTP server)
- SMTP_AUTH_PASS (authentication password for the SMTP server)
- SMTP_FROM_EMAIL= (email address that is permited to send emails from this SMTP server)
- SMTP_TO_EMAIL (email to which the message is send)

3. The security property of the nodemailer transporter is setted to false.
