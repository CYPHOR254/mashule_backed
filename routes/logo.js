const express = require('express');
const router = express.Router();
const multer = require('multer'); // Move this line here
const path = require('path');
const db = require('../database'); // Add your MySQL database connection here

// app.use

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where you want to save the images on the server
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each uploaded image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg'); // You can adjust the file extension if needed
  }
});

const upload = multer({ storage });

// API endpoint for image LOGO upload
router.get('/logo/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(__dirname);
  res.sendFile(path.join(__dirname ,'..', 'public', 'logo', filename));
});




module.exports = router;
