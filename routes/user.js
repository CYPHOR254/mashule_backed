const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../database");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer"); // Move this line here
const nodemailer = require("nodemailer");
require("dotenv").config();

const pool = mysql
  .createPool({
    connectionLimit: 100,
    host: "127.0.0.1", //This is your localhost IP
    user: "root", // "newuser" created in Step 1(e)
    password: "!asapmysql+2enen#", // password for the new user
    database: "mashuledb", // Database name
    port: "3306", // port name, "3306" by default
  })
  .promise();

// Create a storage instance for multer
// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where you want to save the images on the server
    cb(null, "public/logo");
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each uploaded image
    cb(null, file.fieldname + "-" + Date.now());
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg'); // You can adjust the file extension if needed
  },
});

// Create the multer instance
const upload = multer({ storage: storage });



router.post("/register", upload.single("logoUpload"), async (req, res) => {
  try {
    // Extract the file information from req.file
    const logoUpload = req.file.filename; // This assumes the filename is stored by the multer middleware

    // Extract the request body parameters
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      dob,
      password,
      gender,
      schoolName,
      location,
      schoolCode,
      schoolRegNo,
      county,
      subcounty,
      nearestTown,
      ward,
      numberOfStreams,
      numberOfStudents,
      role = "user",
      isactive
    } = req.body;
    // Check if the user already exists in the database based on their email
    const checkUserQuery = "SELECT idusers FROM users WHERE email = ?";
    const [existingUser, _] = await pool.query(checkUserQuery, [email]);
    if (existingUser.length > 0) {
      // User with the same email already exists
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    // Generate a salt and hash the password using the generated salt
    const saltRounds = 10; // This determines the complexity of the hash
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a 10-digit accountNo
    const accountNo = generateAccountNumber();

    function generateAccountNumber() {
      let accountNo = '';
      const digits = '0123456789';

      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        accountNo += digits.charAt(randomIndex);
      }

      return accountNo;
    }

    // Insert the user into the database
    const insertQuery = `INSERT INTO users 
    (firstName, lastName, email, phoneNumber, idNumber, dob, password, gender, schoolName, location,logoUpload, 
    schoolCode, schoolRegNo, county, subcounty, nearestTown, ward, numberOfStreams, numberOfStudents,role , accountNo,isactive ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)`;
    const values = [
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      dob,
      hashedPassword,
      gender,
      schoolName,
      location,
      logoUpload,
      schoolCode,
      schoolRegNo,
      county,
      subcounty,
      nearestTown,
      ward,
      numberOfStreams,
      numberOfStudents,
      role,
      accountNo,
      isactive.toLowerCase() === 'false' ? 0 : 1 // Convert 'false' to 0, 'true' to 1
    ];
    const [result, __] = await pool.query(insertQuery, values);
    console.log(result);

    const schoolData = {
      idusers: result.insertId,
      schoolName,
      location,
      schoolCode,
      logoUpload,
      county,
      subcounty,
      nearestTown,
      numberOfStreams,
      numberOfStudents,
    };

    saveSchoolsDataToDatabase(schoolData);

    async function saveSchoolsDataToDatabase(school) {
      try {
        // Loop through the schoolsData array and insert each school into the "schools" table

        const insertQuery = `
            INSERT INTO schools (idusers, schoolName, location, schoolCode, logoUpload, county, subcounty, nearestTown , numberOfStreams , numberOfStudents)
            VALUES (?, ?, ?, ?, ?, ? , ?, ?, ?, ?)
          `;
        const values = [
          school.idusers,
          school.schoolName,
          school.location,
          school.schoolCode,
          school.logoUpload,
          school.county,
          school.subcounty,
          school.nearestTown,
          school.numberOfStreams,
          school.numberOfStudents
        ];

        // Execute the insert query for each school
        await pool.query(insertQuery, values);
      } catch (err) {
        console.error("Error saving schools data:", err);
        throw err; // Re-throw the error to handle it at a higher level if needed
      }
    }

    if (result.affectedRows === 1) {
      // Send email to user with OTP password
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "earvinekinyua@gmail.com",
          pass: "eobgrnqgysxkdvsh",
        },
      });

      const mailOptions = {
        from: "earvinekinyua@gmail.com",
        to: email,
        subject: "Registration Successful",
        text: `Dear ${firstName} ${lastName},
      
      Welcome to our platform! Your registration has been successfully completed, and you are now part of our community.
      
      Here's a summary of your registration details:
      - Full Name: ${firstName} ${lastName}
      - Email Address: ${email}
      - Phone Number: ${phoneNumber}
      - Account Number: ${accountNo}
      
      At Mashule, we are dedicated to [briefly describe your platform's purpose or mission]. As a member, you will have access to a wide range of features and services designed to [explain the benefits or services your platform offers].
      
      We encourage you to explore your dashboard and take full advantage of the resources available to you. If you have any questions or need assistance, our support team is here to help.
      
      Thank you for choosing Mashule. We look forward to serving you and being a part of your journey.
      
      Best regards,
      The [Mashule ] Team
      [Your Contact Information]`
      };
      

      await transporter.sendMail(mailOptions);
      console.log(result);
      console.log("User registered successfully");
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      console.error("Error registering user: No rows affected");
      return res
        .status(500)
        .json({ error: "Internal server error , No rows affected" });
    }
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal server error, here " });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const getUserQuery = "SELECT * FROM users WHERE email = ?";
    const [userRows, _] = await pool.query(getUserQuery, [email]);
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user account is active
    const isActive = user.isactive === 1; // Convert 1/0 to true/false
    if (!isActive) {
      return res.status(401).json({ error: "Your account is inactive. Please contact the admin for approval." });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const tokenPayload = { userId: user.idusers, email: user.email };
    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Include school ID and user ID in response if user is not an admin
    const responseData = {
      accessToken: accessToken,
      profile: user.role,
      userId: user.idusers
    };

    if (user.role !== 'admin') {
      responseData.schoolId = user.idusers; // Assuming school ID is stored in the user object
    }

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user exists in the database
//     const getUserQuery = "SELECT * FROM users WHERE email = ?";
//     const [userRows, _] = await pool.query(getUserQuery, [email]);
//     const user = userRows[0];

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Check if the user account is active
//     const isActive = user.isactive === 1; // Convert 1/0 to true/false
//     if (!isActive) {
//       return res.status(401).json({ error: "Your account is inactive. Please contact the admin for approval." });
//     }

//     // Compare the provided password with the hashed password
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Generate a JWT token
//     const tokenPayload = { userId: user.idusers, email: user.email };
//     const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     // Include school ID in response if user is not an admin
//     const responseData = {
//       accessToken: accessToken,
//       profile: user.role
//     };

//     if (user.role !== 'admin') {
//       responseData.schoolId = user.idschools; // Assuming school ID is stored in the user object
//     }

//     return res.status(200).json(responseData);
//   } catch (err) {
//     console.error("Error during login:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }

// });


// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user exists in the database
//     const getUserQuery = "SELECT * FROM users WHERE email = ?";
//     const [userRows, _] = await pool.query(getUserQuery, [email]);
//     const user = userRows[0];

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Check if the user account is active
//     const isActive = user.isactive === 1; // Convert 1/0 to true/false
//     if (!isActive) {
//       return res.status(401).json({ error: "Your account is inactive. Please contact the admin for approval." });
//     }

//     // Compare the provided password with the hashed password
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Generate a JWT token
//     const tokenPayload = { userId: user.idusers, email: user.email };
//     const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     return res.status(200).json({ accessToken: accessToken, profile: user.role });
//   } catch (err) {
//     console.error("Error during login:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });







router.get("/users", async (req, res) => {
  try {
    const query = "SELECT * FROM users";
    const [results, fields] = await pool.query(query);

    res.json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching users" });
  }


});

module.exports = router;
