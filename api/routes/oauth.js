const express = require("express");
const bcrypt = require("bcrypt");
var mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken")
const config = require('config')
const schema = new mongoose.Schema({
  email: {
    type: String,
  },
  phone: {
    type: Number,
    minlength: 10,
    maxlength: 10,
  },
  gender: {
    type: String,
  },
  password: {
    type: String,
  },
});
const User = mongoose.model("usersAuth", schema);

router.post("/login", async (req, res) => {
  const result = await User.findOne({ email: req.body.email });
  console.log(result);
  if (result) {
    const passwordCheck = await bcrypt.compare(
      req.body.password,
      result.password
    );
    if (passwordCheck) {
      const tokenCreateObj = {
        id : result._id,
        email : result.email,
        phone : result.phone,
        gender : result.gender
      }
      const token = jwt.sign(tokenCreateObj, config.get("jwtPrivateKey"), { expiresIn: '24h' });
      return res.send(token);
    }
    else{
        res.status(400).send("invalid credentials");
    }
  } else {
    res.status(400).send("invalid email address");
  }
});

router.post("/register", async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  console.log("existingUser", existingUser);
  if (existingUser) {
    return res.status(400).send("user already exists");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("hashedPassword:::", hashedPassword);
    let newUser = new User({
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      password: hashedPassword,
    });

    try {
      newUser = await newUser.save();
      res.send(newUser);
      console.log("user creation success", newUser);
    } catch (err) {
      console.log("user creation err", err);
      res.status(400).send(err);
    }
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Email not registered yet");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save(); // Save the updated user document

    res.send("Password changed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


module.exports = router