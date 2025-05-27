require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/room");
const bookingsRoutes = require("./routes/bookings");
const session = require("express-session");
var cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const DB =
  "mongodb+srv://ashisharoramb:Ashu%409860@meetings-by-mb.qbomnbe.mongodb.net/?retryWrites=true&w=majority&appName=meetings-by-mb";
const app = express();
const PORT = process.env.PORT || 8080;
app.use(
  session({
    secret: "mindbowser",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

// app.use(cors());
// app.options("*", cors());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:1234",
      "https://main--darling-quokka-28a563.netlify.app",
    ],
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingsRoutes);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, async (error) => {
      if (!error)
        console.log(
          "Server is Successfully Running and App is listening on port " + PORT
        );
      else console.log("Error occurred, server can't start", error);
    });
  })
  .catch((err) => console.log(err));
