const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "aashisha9860@gmail.com", // Replace with your Gmail email
    pass: "musilyyvqloipnja", // Replace with your Gmail password
  },
});

module.exports = transporter;
