const express = require("express");
const { ConnectToDB } = require("./connection");
const router = require("./routes/allRoute");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = process.env.PORT;

const allowedOrigins = ["https://www.lyaim.com", "https://lyaim.com"];
//const corsOptions = {
//  origin: function (origin, callback) {
//    if (!origin || allowedOrigins.includes(origin)) {
//      callback(null, true);
//    } else {
//      callback(new Error("Not allowed by Lyaim Tech CORS"));
//    }
//  },
//  credentials: true, //  Allow cookies & authentication headers
//  methods: ["GET", "POST", "PUT", "DELETE"], //  Only allow essential HTTP methods
//  allowedHeaders: ["Content-Type", "Authorization"], //  Restrict allowed headers
//};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by Lyaim Tech CORS"));
    }
  },
  credentials: true, // Allow cookies & authentication headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow essential HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Restrict allowed headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

ConnectToDB(process.env.MONGO_URL)
  .then(() => {
    console.log(" lyaim tech DataBase is Connected");
  })
  .catch((err) => {
    console.log("Error in Mongodb Connection", err);
  });

app.get("/kuldeep", (req, res) => {
  res.send("hello done from my side");
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Lyaim Tech Server is Started at ${PORT} Port`);
});
