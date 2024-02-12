const express = require("express");
const router = express.Router();
const db = require("../database");
const mysql = require("mysql2");
require("dotenv").config();
const nodemailer = require("nodemailer");

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


// Function to send an approval email to the user
function sendApprovalEmail(userEmail) {
    const transporter = nodemailer.createTransport({
      // Configure your email service or SMTP here
      service: "Gmail", // Use your email service provider
      auth: {
        user: "earvinekinyua@gmail.com", // Your email address
        pass: "eobgrnqgysxkdvsh", // Your email password
      },
    });
  
    const mailOptions = {
      from: "earvinekinyua@gmail.com",
      to: userEmail,
      subject: "Account Updated Successfully and Approved",
      html: "<p>Your account has been updated and approved. You can now log in.</p>",
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending approval email:", error);
      } else {
        console.log("Approval email sent:", info.response);
      }
    });
  }
  function sendDeactivationEmail(userEmail) {
    const transporter = nodemailer.createTransport({
      // Configure your email service or SMTP here
      service: "Gmail", // Use your email service provider
      auth: {
        user: "earvinekinyua@gmail.com", // Your email address
        pass: "eobgrnqgysxkdvsh", // Your email password
      },
    });
  
    const mailOptions = {
      from: "earvinekinyua@gmail.com",
      to: userEmail,
      subject: "Account deactivited  Successfully ",
      html: "<p>Your account has been deactivated  and its currently unactive. You cannot log in.Please contact admin for updates</p>",
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending approval email:", error);
      } else {
        console.log("Approval email sent:", info.response);
      }
    });
  }

  
  router.put("/api/users/:iduser", async (req, res) => {
    const userId = req.params.iduser;
    const userData = req.body;

    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Check if the user's isactive status is being changed to inactive
        if (userData.isactive === false) {
            // Check if the user was previously active
            const [activeResult] = await connection.execute(
                "SELECT isactive FROM users WHERE idusers = ?",
                [userId]
            );

            if (activeResult.length > 0 && activeResult[0].isactive === true) {
                // Get the user's email from the database
                const [emailResult] = await connection.execute(
                    "SELECT email FROM users WHERE idusers = ?",
                    [userId]
                );

                if (emailResult.length > 0) {
                    const userEmail = emailResult[0].email;
                    // Send an email to inform the user that they need approval from the admin
                    sendApprovalEmail(userEmail);
                }
            }
        }

        // Update the user in the database
        const [result] = await connection.execute(
            "UPDATE users SET role = ?, isactive = ? WHERE idusers = ?",
            [userData.role, userData.isactive, userId]
        );

        // Release the connection back to the pool
        connection.release();

        if (result.affectedRows > 0) {
            res.json({ message: "User updated successfully" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "An error occurred while updating the user" });
    }
});



// Define a route to handle user updates
// router.put("/api/users/:iduser", async (req, res) => {
//     const userId = req.params.iduser;
//     const userData = req.body;
  
//     try {
//       // Get a connection from the pool
//       const connection = await pool.getConnection();
  
//       // Update the user in the database
//       const [result] = await connection.execute(
//         "UPDATE users SET role = ?, isactive = ? WHERE idusers = ?",
//         [userData.role, userData.isactive, userId]
//       );
  
//       // Release the connection back to the pool
//       connection.release();
  
//       if (result.affectedRows > 0) {
//         // Get the user's email from the database
//         const [emailResult] = await pool.execute(
//           "SELECT email FROM users WHERE idusers = ?",
//           [userId]
//         );
  
//         if (emailResult.length > 0) {
//           const userEmail = emailResult[0].email;
//           // Send an approval email to the user
//           sendApprovalEmail(userEmail);
//         }
  
//         res.json({ message: "User updated successfully" });
//       } else {
//         res.status(404).json({ error: "User not found" });
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//       res.status(500).json({ error: "An error occurred while updating the user" });
//     }
//   }); 

  // Define a route to handle updating isactive from 1 to 0
router.put("/api/users/deactivate/:iduser", async (req, res) => {
  const userId = req.params.iduser;
  console.log(userId)

  try {
      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Update the user's isactive status to 0 in the database
      const [result] = await connection.execute(
          "UPDATE users SET isactive = 0 WHERE idusers = ?",
          [userId]
      );

      // Release the connection back to the pool
      connection.release();

      if (result.affectedRows > 0) {
          // Get the user's email from the database
          const [emailResult] = await pool.execute(
              "SELECT email FROM users WHERE idusers = ?",
              [userId]
          );

          if (emailResult.length > 0) {
              const userEmail = emailResult[0].email;
              // Send an email to the user notifying them of the change
              sendDeactivationEmail(userEmail);
          }

          res.json({ message: "User isactive updated successfully" });
      } else {
          res.status(404).json({ error: "User not found" });
      }
  } catch (error) {
      console.error("Error updating user isactive:", error);
      res.status(500).json({ error: "An error occurred while updating the user isactive" });
  }
});



module.exports = router;
