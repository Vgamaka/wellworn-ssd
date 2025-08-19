require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const router = require("./router");
const axios = require("axios");
const NodeCache = require("node-cache");

// Firebase Admin Initialization
const credentials = require("./util/firebase/credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// File Upload Setup
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit set to 20MB
});

// Middleware Setup
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Set Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// MongoDB Connection
const uri =
  process.env.MONGO_URI ||
  "mongodb+srv://wellwornsl:wellwornsl123@wellwornsl.ytwnfha.mongodb.net/test?retryWrites=true&w=majority";

const connect = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connection Success..!!");
  } catch (error) {
    console.log("Connection Error", error);
  }
};

connect();

// API Routes
app.post("/api/upload", upload.single("image"), (req, res) => {
  const filePath = req.file.path;
  res.json({ filePath });
});
const cache = new NodeCache({ stdTTL: 24 * 60 * 60 }); // 24 hours TTL

app.get("/api/get-user-location", async (req, res) => {
  const bypassCache = req.query.bypassCache === "true";

  if (!bypassCache) {
    const cachedLocation = cache.get("userLocation");
    if (cachedLocation) {
      console.log("Serving cached location:", cachedLocation);
      return res.json(cachedLocation);
    }
  }

  // Extract client IP address
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    console.log("Fetching location from IP geolocation API...");
    const response = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    console.log("Fetched location data:", response.data);

    const locationData = response.data;

    // Cache the location data
    cache.set("userLocation", locationData);

    res.json(locationData);
  } catch (error) {
    console.error("Error fetching location:", error.message);
    res.status(500).json({ error: "Error fetching location" });
  }
});



app.get("/api/get-exchange-rate", async (req, res) => {
  try {
    console.log("Fetching fresh exchange rate...");
    const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
    const exchangeRate = response.data.rates.LKR;
    console.log("Fetched exchange rate from API:", exchangeRate);

    cache.set("exchangeRate", exchangeRate); // Cache the rate
    res.json({ rate: exchangeRate });
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    res.status(500).json({ error: "Error fetching exchange rate" });
  }
});



app.get("/api/clear-all-caches", (req, res) => {
  if (!cache) {
    console.error("Cache is not initialized");
    return res.status(500).json({ message: "Cache is not defined" });
  }

  cache.flushAll(); // Clear NodeCache
  console.log("All caches cleared.");
  res.status(200).json({ message: "All caches cleared. Please clear local storage on the client." });
});


app.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  // Log request body for debugging
  console.log("Received request:", req.body);

  if (!email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let transporter = nodemailer.createTransport({
    host: "mail.wellworn.lk",
    port: 465,
    secure: true,
    auth: {
      user: "orders@wellworn.lk",
      pass: "123wellhelp#$",
    },
  });

  const combinedMessage = `
    <p>Dear Customer,</p>
    <p>Thank you for reaching out to WellWorn. Below is the answer to your request:</p>
    <p><strong>Our Answer:</strong></p>
    <p>${message}</p>
    <hr />
    <p><strong>Additional Information:</strong></p>
    <p>Refund Policy: You are eligible for a full refund within 30 days of purchase. Please ensure the item is unused and in its original condition for a smooth refund process.</p>
    <p>Contact us at support@wellworn.lk if you have further inquiries.</p>
    <p>Best regards,</p>
    <p>WellWorn Private Limited</p>
  `;

  // Log combined message for debugging
  console.log("Combined Message:", combinedMessage);

  let mailOptions = {
    from: '"WellWorn Private Limited" <orders@wellworn.lk>',
    to: email,
    subject: subject,
    html: combinedMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Error sending email", details: error.message });
  }
});


// Additional Routes
app.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  res.json({ user: "user data", token: "user session token" });
});

// Apply Routes
app.use("/api", router);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
