const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("config");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/auth/login/failed",
  })
);

router.get("/login/success", (req, res) => {
  try {
    if (req.user) {
      if (req.user._json.hd === "mindbowser.com") {
        jwt.sign(
          { id: req.user.id, name: req.user._json.email },
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              error: false,
              message: "Successfully loged in",
              user: req.user,
              access_token: token,
            });
          }
        );
      } else {
        res.status(401).json({
          error: true,
          message: "Please login with Mindbowser mail only",
        });
      }
    } else {
      res.status(403).json({ error: true, message: "Not Authorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong!" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.delete("/logout", async (req, res) => {
  // try {
  //   // req.logOut(() => {
  //   //   req.user = null;
  //   //   // res.cookie("connect.sid", null);
  //   //   res.end();
  //   // });
  //   req.logout(() => {
  //     res.redirect(process.env.CLIENT_URL);
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({ error: true, message: "something went wrong!" });
  // }
  req.logout(function (err) {
    res.clearCookie("connect.sid");
      req.session.destroy(function (err) {
      // destroys the session
      res.send();
    });
  });
});

module.exports = router;
