CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(255) NOT NULL,
  idNumber VARCHAR(255) NOT NULL,
  DOB DATE NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(255) NOT NULL,
  schoolName VARCHAR(255) NOT NULL,  
  location VARCHAR(255) NOT NULL,
  numberOfStreams INT NOT NULL,
  numberOfStudents INT NOT NULL,
  schoolEvents VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  isactive BOOLEAN DEFAULT false
);
 
 {
      "id": 3,
      "firstName": "morris",
      "lastName": "Murega",
      "email": "murega.morris@ekenya.co.ke",
      "phoneNumber": 759432206,
      "idNumber": "49369344",
      "DOB": "",
      "password": "Test$1234",
      "confirmPassword": "",
      "gender": "male",
      "schoolName": "muthambi",
      "location": "chuka",
      "numberOfStreams": "3",
      "numberOfStudents": "490",
      "schoolEvents": "drama ",
      "role": "admin",
      "isactive": true
    },