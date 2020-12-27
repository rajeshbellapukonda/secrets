require("dotenv").config()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const saltRounds = 10
const PORT = process.env.PORT || 3000

const app = express()

//configure Embedded JS (ejs) package
app.set("view engine", "ejs")

//Configure body-parser package to handle request object
app.use(bodyParser.urlencoded({extended: true}))

//configure public folder to download the files from. Files such as CSS, images etc.
app.use(express.static("public"))

//Connect to mongoose db
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbHost=process.env.DB_HOST

const dbConnectionURL="mongodb+srv://"+dbUser+":"+dbPassword+"@"+dbHost+"/userDB?retryWrites=true&w=majority"

mongoose.connect(dbConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true })

//Create mongoose schema and mongoose model to connect with users collection in userDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

const User = mongoose.model("User", userSchema)

app.get("/", function(req,res){
  res.render("home")
})

app.get("/login", function(req,res){
  res.render("login")
})

app.get("/register", function(req,res){
  res.render("register")
})

app.post("/register",function(req,res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash
    })

    newUser.save(function(err){
      if (!err) {
        res.render("secrets")
      }
    })
  });


})

app.post("/login", function(req,res){
  const username = req.body.username
  const password = req.body.password

  User.findOne({email: username}, function(err, foundUser){

    if(!err){
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          // result == true
          if (result === true){
            res.render("secrets")
          } else {
            res.send("password do not match")
          }
        })
      }
    }
  })
})

//Start the server
app.listen(PORT, function(){
  console.log("Server started successfully on port "+PORT);
})
