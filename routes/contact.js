var express = require("express"),
  nodemailer = require("nodemailer"),
  request = require("request"),
  router = express.Router();

// contact form
router.get("/", function(req, res) {
  res.render("contact/contactMe", { page: "contact" });
});

router.post("/send", function(req, res) {
  const captcha = req.body["g-recaptcha-response"];
  if (!captcha) {
    console.log(req.body);
    req.flash("error", "Please select captcha");
    return res.redirect("back");
  }
  // secret key
  var secretKey = process.env.CAPTCHA;
  // Verify URL
  var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_API_SECRET}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
  // Make request to Verify URL
  request.get(verifyURL, (err, response, body) => {
    // if not successful
    // if (err) {
    //   console.log(err);
    // }
    // if (body.success !== undefined && !body.success) {
    //   req.flash("error", "Captcha Failed");
    //   return res.redirect("/contact");
    // }
    console.log("We made it this far");
    var smtpTransport = nodemailer.createTransport({
      //service: "Gmail",
      host: "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        // user: 'pavance40@gmail.com',
        user: "postmaster@sandbox6e294e4539894d41bc75d9f5c6420e81.mailgun.org",
        pass: process.env.GMAILPW1
      }
    });

    var mailOptions = {
      //from: "Chris Galvan <pavance40@gmail.com",
      from: req.body.email,
      to: "pavance40@gmail.com",
      replyTo: req.body.email,
      subject: "bodhishare contact request from: " + req.body.name,
      text:
        "You have received an email from... Name: " +
        req.body.name +
        " Phone: " +
        req.body.phone +
        " Email: " +
        req.body.email +
        " Message: " +
        req.body.message,
      html:
        "<h3>You have received an email from...</h3><ul><li>Name: " +
        req.body.name +
        " </li><li>Phone: " +
        req.body.phone +
        " </li><li>Email: " +
        req.body.email +
        " </li></ul><p>Message: <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
        req.body.message +
        " </p>"
    };

    smtpTransport.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.log(err);
        req.flash("error", "Something went wrong... Please try again later!");
        res.redirect("/contact");
      } else {
        req.flash(
          "success",
          "Your email has been sent, we will respond within 24 hours."
        );
        res.redirect("/bodhis");
      }
    });
  });
});

module.exports = router;
