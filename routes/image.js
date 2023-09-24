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
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each uploaded image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg'); // You can adjust the file extension if needed
  }
});



const upload = multer({ storage });

// API endpoint for image upload
router.post('/api/upload', upload.array('images', 10), async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Extract schools ID from the request body
    const { idschools } = req.body;

    // Validate and process the uploaded files
    const imageDetails = [];

    for (const imageFile of req.files) {
      // Check if the file is an image (you can customize this validation)
      if (!imageFile.mimetype.startsWith('image')) {
        return res.status(400).json({ error: 'Uploaded file is not an image.' });
      }

      // Push the image details to the array
      imageDetails.push({
        file_name: imageFile.filename,
        image_data: imageFile.size,
        idschools: idschools,
      });
    }

    // Save the image details to the database
    const query = 'INSERT INTO images (file_name, image_data, idschools) VALUES ?';
    await db.query(query, [imageDetails.map((image) => [image.file_name, image.image_data, image.idschools])]);

    // Respond with a success message
    console.log("Image uploaded successfully");
    res.json({ message: 'Images uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  a new route to retrieve images by schools id
router.get('/api/images/:idschools', async (req, res) => {
  try {
    // Extract the image ID from the request parameters
    const { idschools } = req.params;

    // Query the database to retrieve the image by ID
    const query = 'SELECT * FROM images WHERE idschools = ?';
    const [image] = await db.query(query, [idschools]);

    // Check if the image exists
    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    // Respond with the image data
    res.json(image);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for image  upload
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(__dirname);
  res.sendFile(path.join(__dirname ,'..', 'public', 'images', filename));
});

// Add a route to retrieve all images
router.get('/api/images', async (req, res) => {
  try {
    // Query the database to retrieve all images
    const query = 'SELECT * FROM images';
    const images = await db.query(query);

    // Respond with the list of images
    res.json(images);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});

router.delete('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  // Delete the image from storage and remove related data from your database
  res.status(200).json({ message: 'Image deleted successfully' });
});

// Add the following endpoints to your Node.js backend:
// Get albums for a specific school
router.get('/api/schools/:schoolId/albums', async (req, res) => {
  const { imaged } = req.params;
  try {
    const [rows] =  db.query('SELECT * FROM albums WHERE school_id = ?', [schoolId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get images for a specific album
router.get('/api/albums/:albumId/images', async (req, res) => {
  const { albumId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM images WHERE idschools = ?', [idschools]);
    console.log(rows)

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
