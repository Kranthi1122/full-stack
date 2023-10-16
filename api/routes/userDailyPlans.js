const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require('config');

const router = express.Router();

const schema = new mongoose.Schema({
  userId: {
    type: String,
  },
  time: {
    type: Date,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
});

const User = mongoose.model("userdailyplans", schema);

// Middleware to verify and decode the JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("token:::",token)


  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
    cleanToken = token.slice(7);
    console.log(cleanToken);
  jwt.verify(cleanToken, (config.get("jwtPrivateKey")), (err, decoded) => {
    if (err) {
        console.log("token-verify-err::::",err)

      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.userId = decoded.id; // Store the 'id' from the token in the request object
    next();
  });
};

router.get("/dailytasks", verifyToken, async (req, res) => {
  try {
    const result = await User.find({ userId: req.userId });
    if (result) {
      res.send(result);
    } else {
      res.status(400).send("User doesn't have tasks");
    }
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post("/createtask", verifyToken, async (req, res) => {
  try {
    const newUser = new User({
      userId: req.userId,
      time: req.body.time,
      title: req.body.title,
      description: req.body.description,
    });

    const savedTask = await newUser.save();
    res.send(savedTask);
  } catch (err) {
    res.status(400).send("Task creation error");
  }
});


router.delete("/delete", verifyToken, async (req, res) => {
    try {
      const deletedTask = await User.findByIdAndDelete(req.body.id);
      if (deletedTask) {
        res.status(200).json({ message: "Task deleted successfully" });
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

module.exports = router;
