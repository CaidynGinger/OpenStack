const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const cors = require("cors");
require("dotenv/config");
const bodyParser = require('body-parser');

const allowedOrigins = require('./config/allowedOrigins')

const credentials = require("./middleware/credentials");

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Middleware

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

//middleware for cookies
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('images'))
app.use('/images', express.static('images'))

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(routes);

app.use("/refresh", require("./routes/refresh.routes"));



mongoose.connect(process.env.DB_CONNECTION, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected");
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server has started on Port: ${PORT}`);
});
