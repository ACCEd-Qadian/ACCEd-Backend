const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const port = process.env.PORT || 2000;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/useModel");
const Certificate = require("./models/certificateModel");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(
  "mongodb+srv://acced:ObQn8maGlhjlCW8m@clusteracced.vxkfu0a.mongodb.net/ACCEd?retryWrites=true&w=majority",
  {
    
  }
);

// GET API
app.get("/", (req, res) => {
  res.send(`server is ready on the port ${port}`);
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alitaarique14@gmail.com", // Your Gmail email address
    pass: "quopcatuirjduwbf", // Your Gmail password or application-specific password
  },
});



// APIs endpoint for certificate upload
app.post("/uploadCertificate", async (req, res) => {
  const {
    studentName,
    fatherName,
    enrollmentNumber,
    course,
    grade,
    startdate,
    enddate,
    date,
  } = req.body;

  if (enrollmentNumber === "") {
    return res.status(400).send({ error: "Fill in all the fields" });
  }
  try {
    // Check if enrollment number already exists
    const existingCertificate = await Certificate.findOne({ enrollmentNumber });
    if (existingCertificate) {
      return res.status(400).send({ error: "Enrollment already exists" });
    }

    // Create a new student document
    const newCertificate = new Certificate({
      studentName,
      fatherName,
      enrollmentNumber,
      course,
      grade,
      startdate,
      enddate,
      date,
    });

    // Save the student document to MongoDB
    await newCertificate.save();
    res.send({ message: "Student data saved successfully" });
  } catch (error) {
    console.error("Error saving student data:", error);
    res.status(500).send({error:"Error saving student data"});
  }
});

// Student Data Search API
app.get("/certificateSearch", async (req, res) => {
    const { enrollmentNumber } = req.query;
  
    try {
      // Find student data by enrollment number
      const searchData = await Certificate.findOne({ enrollmentNumber });
      if (searchData) {
        res.json(searchData);
      } else {
        res.status(404).send({error:"Data not found"});
      }
    } catch (error) {
      console.error("Error searching student data:", error);
      res.status(500).send({error:"Error searching student data"});
    }
  });


// Register API

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    // Save the user to the database
    const createdUser = await user.save();

    // Send response
    res.send({
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ error: "Error registering user" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      return;
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
});


// In-memory storage for simplicity. You may want to use a database.
const otpMap = new Map();

// Route to send OTP via email
app.post("/sendotp", (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // Store OTP with user's email
  otpMap.set(email, otp);

  const mailOptions = {
    from: "alitaarique14@gmail.com", // Sender address
    to: email, // Recipient address
    subject: "Your OTP FROM ACCEd Qadian", // Email subject
    text: `Your OTP is: ${otp} for Password Reset on the ACCEd Site.`, // Email body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
      res.status(500).send({ error: "Failed to send OTP" });
    } else {
      console.log(`OTP sent successfully to ${email}`);
      res.send({ success: true });
    }
  });
});

// Route for resetting password with OTP verification
app.post("/resetpassword", async (req, res) => {
  const { email, otp, password } = req.body;

  // Retrieve OTP for the email
  const storedOTP = otpMap.get(email);

  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).send({ error: "Invalid OTP" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Update user's password
    user.password = bcrypt.hashSync(password, 8);
    await user.save();

    // Clear OTP after successful verification
    otpMap.delete(email);

    res.send({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send({ error: "Failed to update password" });
  }
});

app.listen(port, () => {
  console.log(`server is ready on the port ${port}`);
});
