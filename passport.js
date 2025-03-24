const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const User = require("./models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      try {
        if (profile._json?.hd === "mindbowser.com") {
          const user = await User.findOne({ email: profile._json.email });
          if (user) {
            done(null, profile);
          } else {
            const newUser = new User({
              firstName: profile._json.given_name,
              lastName: profile._json.family_name,
              id: profile.id,
              email: profile._json.email,
            });
            await newUser.save();
            done(null, newUser);
          }
        } else {
          done(null, profile);
        }
      } catch (error) {
        console.log(error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
