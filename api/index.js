const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const oauth = require('./routes/oauth')
var mongoose = require('mongoose');
const config = require('config')
const userDailyTasks = require('./routes/userDailyPlans')
const app = express()


if (!config.get("jwtPrivateKey")) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined');
  process.exit(1);
}


var mongoDB = 'mongodb://localhost/fullstack';
try{
    mongoose.connect(mongoDB, { useNewUrlParser: true });
    console.log("mongoose connected successfully")
}
catch(err){
  console.log("mongoose connection fail",err)
}

app.use(cors())
app.use(express.json())

app.use("/oauth",oauth)
app.use("/user",userDailyTasks)


const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log("app listening at 3000.....")
})