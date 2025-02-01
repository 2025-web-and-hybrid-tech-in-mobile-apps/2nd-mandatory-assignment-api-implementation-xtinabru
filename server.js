const express = require("express");
const app = express();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const port = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// Your solution should be written here

const users = [ { userHandle: "DukeNukem", password: "123456" }]; // save the users
const MYSECRETJWTKEY = "mysecret";


// 1st endpoint signup
app.post('/signup', (req, res) => {

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

  if (users.find((u) => u.userHandle === userHandle)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ userHandle, password });
  return res.status(201).json({message: "User registered successfully"})

})

// 2nd endpoint login
app.post('/login', (req, res) => {
  const { userHandle, password } = req.body; // get the data from the req

  console.log("Received data:", { userHandle, password }); 

  if (!userHandle || !password) {
    return res.status(400).json({ message: "User handle and password are required" });
  }

  const user = users.find((u) => u.userHandle === userHandle); 

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Unauthorized, incorrect username or password" });
  }
  const token = jwt.sign({userHandle: user.userHandle}, MYSECRETJWTKEY, {expiresIn: "1h"})

 return res.status(200).json({
  message: "Login successful, JWT token provided",
  token: token
});
});

// jwt strategy

passport.use(
  new JwtStrategy(
    { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),// take the token out of Authorization HEader
      secretOrKey: MYSECRETJWTKEY,
    }, 
  (jwt_payload, done) => {
    const user = users.find((u) => u.userHandle === jwt_payload.userHandle);

    if(user) {
      return done(null, user) // if the user is found
    } else {
      return done(null, false) // if not
    }
  })
)

// 3rd endpoint high scores

const highScores = [];

app.post('/high-scores', (req, res, next) => {

  //  check if there is a header Authorization
  if(!req.headers.authorization){
    return res.status(401).json({message: "Unauthorized, JWT token is missing or invalid"})
  }
  next();
},
passport.authenticate("jwt", {session: false}), //  midd check the token
(req, res) => {

  const { level, userHandle, score, timestamp } = req.body;

  if (level == null || userHandle == null || score == null || timestamp == null) { // check if all required parametres are passed
    return res.status(400).json({message: "Invalid request body"});
  }
  highScores.push({ level, userHandle, score, timestamp });

  return res.status(201).json({message: "High score posted successfully"})
})

// 4th endpoint 
app.get('/high-scores', (req, res, ) => {

  const { level, page = 1} = req.query // get level and page (if there is no page -> it is 1 by default)

  if(!level){
    return res.status(400).json({message: "Level is required"})
  }

  const filteredScores = highScores.filter(score => score.level === level) // filter only those scores where the level matches

  const sortedScores = filteredScores.sort((a,b) => b.score - a.score) //sort

  const startIndex = (page - 1) * 20; // make the pagination
  const paginatedScores = sortedScores.slice(startIndex, startIndex + 20);

  return res.status(200).json({paginatedScores})
})


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
