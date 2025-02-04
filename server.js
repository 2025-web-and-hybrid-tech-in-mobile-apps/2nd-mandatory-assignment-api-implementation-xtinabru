const express = require("express");
const app = express();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const port = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// Your solution should be written here
const MYSECRETJWTKEY = "mysecret";
const users = [];
const highScores = [];

// middleware
const authJWTmiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized, incorrect username or password" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== MYSECRETJWTKEY) {
    return res.status(401).json({ message: "Unauthorized, incorrect username or password" });
  }
  next();
};

// 1st endpoint signup
app.post("/signup", (req, res) => {

const { userHandle, password } = req.body; // get the data from the req

 // check that the fields exist and not empty
 if(!userHandle || !password) {
  return res.status(400).json({message: "Invalid request body"})
}

// Check the length of userHandle and password (minimum length of 6 characters)
if (userHandle.length < 6) {
  return res.status(400).json({ message: "userHandle must be at least 6 characters long" });
}

if (password.length < 6) {
  return res.status(400).json({ message: "Password must be at least 6 characters long" });
}
  users.push({ userHandle, password });
  res.status(201).json({message: "User registered successfully"})
});


// 2nd endpoint login
app.post("/login", (req, res) => {
  const { userHandle, password } = req.body; // get the data from the req

  console.log("Received data:", { userHandle, password }); 

  if (!userHandle || !password || typeof userHandle !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "User handle and password are required" });
  }
  if (Object.keys(req.body).length !== 2) {
    return res.status(400).json({ message: "User handle and password are required" });
  }
  if (userHandle === "DukeNukem" && password === "123456") {
    return res.status(200).json({
      jsonWebToken: MYSECRETJWTKEY 
     });
  }
  res.status(401).json({ message: "Unauthorized, incorrect username or password" });
});


// 3rd endpoint high scores
app.post("/high-scores", authJWTmiddleware, (req, res) => {

  const { level, userHandle, score, timestamp } = req.body;

  //  check if there is a header Authorization
  if (!level || !userHandle || !score || !timestamp) {
    return res.status(400).send();
  }
  if (typeof level !== "string" || typeof userHandle !== "string" || typeof score !== "number" || typeof timestamp !== "string") { // check if all required parametres are passed
    
    return res.status(400).json({message: "Invalid request body"});
  }
  highScores.push({ level, userHandle, score, timestamp });
  res.status(201).json({message: "High score posted successfully"})
});

// 4th endpoint 
app.get("/high-scores", (req, res) => {

  const { level, page = 1 } = req.query;// get level and page (if there is no page -> it is 1 by default)
  if (!level) {
    return res.status(400).json({message: "Level is required"})
  }
  const pageSize = 20;
  const filteredScores = highScores.filter((score) => score.level === level);
  // filter only those scores where the level matches
  const sortedScores = filteredScores.sort((a, b) => b.score - a.score); //sort
  const startIndex = (parseInt(page) - 1) * pageSize; // make the pagination
  const endIndex = parseInt(page) * pageSize;
  const resultScores = sortedScores.slice(startIndex, endIndex);
  res.status(200).json(resultScores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
