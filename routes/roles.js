const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require("../database");

const pool = mysql.createPool({
    connectionLimit: 100,
    host: "127.0.0.1",       //This is your localhost IP
    user: "root",         // "newuser" created in Step 1(e)
    password: "!asapmysql+2enen#",  // password for the new user
    database: "mashuledb",      // Database name
    port: "3306",          // port name, "3306" by default
  }).promise();


  router.get('/getrole', async (req, res) => {
    const { email } = req.query;
  
    try {
      const [rows] = await db.execute('SELECT role FROM users WHERE email = ?', [email]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ role: rows[0].role });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


module.exports = router;
