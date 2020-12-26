require("dotenv").config()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const express = require("express")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
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

//Enable database encryption using Mongoose-encryption package
//It requires Mongoose-encrypt package and uses mongoose plugin framework to encrypt and decrypt
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User",userSchema)

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
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })

  newUser.save(function(err){
    if (!err) {
      res.render("secrets")
    }
  })
})

app.post("/login", function(req,res){
  User.findOne({email: req.body.username}, function(err, foundUser){
    if(!err){
      if(foundUser){
        if (foundUser.password === req.body.password){
          res.render("secrets")
        }
      }
    }
  })
})

//Start the server
app.listen(PORT, function(){
  console.log("Server started successfully on port "+PORT);
})
