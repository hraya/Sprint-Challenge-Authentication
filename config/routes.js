const axios = require("axios");
const db = require("../database/dbConfig.js");
const bcrypt = require("bcryptjs");


const { authenticate, generateToken } = require("../auth/authenticate");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 14);
  creds.password = hash;
  db.insert(creds)
    .then(ids => {
      db.findById(ids[0])
        .then(user => {
          const token = generateToken(user);
          res.status(201).json({ username: user.username, token });
        })
        .catch(err => {
          res.status(500).json({ error: "could not make new user" });
        });
    })
    .catch(err => {
      res.status(500).json(err);
    });
}

function login(req, res) {
  // implement user login
  const creds = req.body;
  db.findByUsername(creds.username)
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user);
        res.json({ Welcome: user.username, token });
      } else {
        res.status(401).json({ message: "Not Authorized" });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
