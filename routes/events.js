const express = require("express");
const router = express.Router();
const db = require("../database");
const mysql = require("mysql2");
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

  
// Create a new event
router.post('/add/events', async (req, res) => {
    const { eventName, eventType, eventDate, eventTime, location, status ,idschools } = req.body;
  
    // Check if required fields are missing in the request
    if (!eventName || !eventType || !eventDate || !eventTime || !location || !status  || !idschools ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    // Create a new event object
    const newEvent = {
      eventName,
      eventType,
      eventDate,
      eventTime,
      location,
      status,
      idschools
    };
  
    // Insert the new event into the database
    try {
      const [result] = await pool.query('INSERT INTO events SET ?', newEvent);
      console.log('Event created successfully');
      return res.status(201).json({ message: 'Event created successfully', responseCode:"00", eventId: result.insertId });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Error creating event' });
    }
  });
  
  

// Retrieve all events from the database
router.get('/events', async (_req, res) => {
    try {
      const [rows, fields] = await pool.query('SELECT * FROM events');
      res.json(rows);
    } catch (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Error retrieving events' });
    }
  })
     
  // Update an existing event
router.put('/update/events/:eventId', async (req, res) => {
  const idevents = req.params.eventId;
  const { eventName, eventType, eventDate, eventTime, location, status, idschools } = req.body;

  // Check if required fields are missing in the request
  if (!eventName || !eventType || !eventDate || !eventTime || !location || !status || !idschools) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Create an updated event object
  const updatedEvent = {
    eventName,
    eventType,
    eventDate,
    eventTime,
    location,
    status,
    idschools
  };

  // Update the event in the database
  try {
    const [result] = await pool.query('UPDATE events SET ? WHERE idevents = ?', [updatedEvent, idevents]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    console.log('Event updated successfully');
    return res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Error updating event' });
  }
});




// Retrieve events for a specific school by school ID
router.get('/schools/:schoolId/events', async (req, res) => {
  const schoolId = req.params.schoolId;

  try {
    // Execute a SELECT query to retrieve events for the specified school
    const [eventRows] = await pool.query(
      'SELECT * FROM events WHERE idschools = ?',
      [schoolId]
    );

    res.json(eventRows);
  } catch (error) {
    console.error('Error retrieving events for school:', error);
    res.status(500).json({ error: 'Error retrieving events for school' });
  }
});

// Delete an event by ID
router.delete('/delete/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;

  try {
    // Execute a DELETE query to delete the event by its ID
    const [result] = await pool.query('DELETE FROM events WHERE idevents = ?', [eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    console.log('Event deleted successfully');
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Error deleting event' });
  }
});


  module.exports = router;
