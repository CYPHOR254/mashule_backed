const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require("../database");
const axios = require('axios');


const pool = mysql.createPool({
  connectionLimit: 100,
  host: "127.0.0.1",       //This is your localhost IP
  user: "root",         // "newuser" created in Step 1(e)
  password: "!asapmysql+2enen#",  // password for the new user
  database: "mashuledb",      // Database name
  port: "3306",          // port name, "3306" by default
}).promise();


// Endpoint to fetch schools data and send to frontend
router.get('/schools', async (req, res) => {
  try {
      const query = 'SELECT idusers, schoolName, location, schoolCode,logoUpload , county , subcounty , nearestTown , numberOfStreams ,numberOfStudents FROM schools';
    const [result] = await pool.query(query);
// console.log(result);

    const schoolsData = result.map((school) => ({
      id: school.idusers,
      schoolName: school.schoolName,
      location: school.location,
      schoolCode: school.schoolCode,
      county: school.county,
      subcounty:school.subcounty,
      nearestTown:school.nearestTown,
      numberOfStreams:school.numberOfStreams,
      numberOfStudents:school.numberOfStudents,
    }));

    // Send the fetched schools data to the frontend
    res.json(schoolsData);
  } catch (err) {
    console.error('Error fetching schools:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/schools/:schoolCode', async (req, res) => {
  const idusers= req.params.schoolCode; // Extract the school code from the URL parameter
  
  try {
    // Fetch the school data by school code from the database
    const selectQuery = 'SELECT * FROM schools WHERE idusers = ?';
    const [schoolData] = await pool.query(selectQuery, [idusers]);
    
    // Check if the school was found
    if (!schoolData) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    // Respond with the fetched school data
    res.json({ success: true, school: schoolData });
  } catch (err) {
    console.error('Error fetching school data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/schools/:id', async (req, res) => {
//   const schoolId = req.params.id; // Extract the school ID from the URL parameter
  
//   try {
//     // Fetch the school data by ID from the database
//     const selectQuery = 'SELECT * FROM schools WHERE id = ?';
//     const [schoolData] = await pool.query(selectQuery, [schoolId]);
    
//     // Check if the school was found
//     if (!schoolData) {
//       return res.status(404).json({ error: 'School not found' });
//     }
    
//     // Respond with the fetched school data
//     res.json({ success: true, school: schoolData });
//   } catch (err) {
//     console.error('Error fetching school data:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

module.exports = router;

