require("dotenv").config()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy
const passportLocalMongoose = require("passport-local-mongoose")

const PORT = process.env.PORT || 3000

const app = express()

//configure Embedded JS (ejs) package
app.set("view engine", "ejs")

//Configure body-parser package to handle request object
app.use(bodyParser.urlencoded({extended: true}))

//configure public folder to download the files from. Files such as CSS, images etc.
app.use(express.static("public"))

//Configure express session to use in nodeJS
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}))

//To use passport in Express, it need to be initialised as below
app.use(passport.initialize());
app.use(passport.session());

//Connect to mongoose db
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbHost=process.env.DB_HOST

const dbConnectionURL="mongodb+srv://"+dbUser+":"+dbPassword+"@"+dbHost+"/userDB?retryWrites=true&w=majority"

mongoose.connect(dbConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true);

//Create mongoose schema and mongoose model to connect with users collection in userDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

//Add Passport local mongoose as plugin to user schema to register and login users
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

// Configures passport to use Local strategy i.e. use local username and password
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home")
})

app.get("/login", function(req,res){
  res.render("login")
})

app.get("/register", function(req,res){
  res.render("register")
})

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets")
  } else {
    res.redirect("/")
  }
})

app.get("/logout", function(req,res){
  req.logout()
  res.redirect("/")
})

app.post("/register",function(req,res){
  User.register(new User({username: req.body.username}), req.body.password, function(err){
    if (err){
      console.log(err);
      res.render("register")
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets")
    })
  })


})

app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), function(req, res){
  res.redirect("/secrets")
})

//Start the server
app.listen(PORT, function(){
  console.log("Server started successfully on port "+PORT);
})
