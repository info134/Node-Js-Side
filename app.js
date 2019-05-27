const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
var bodyParser = require('body-parser');
const config = require("./config/database")
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require('express-session');
const passport = require("passport");
const request = require("request");


mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

//check connection
db.once("open", function(){
  console.log("connected mongodb");
});

// check dberror
db.on("error", function(err){
  console.log(err);
})

//initialize App
const app = express();



//Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname,"public")))

//bring in models
let Article = require("./models/article");
let User = require("./models/user");

//session express middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));


//express flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//passport configurable
require('./config/passport.js')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());
const fs= require("fs");

app.get("*", function(req,res,next){
  console.log(req.header('user-agent')); // User Agent we get from headers
  console.log(req.header('referrer')); //  Likewise for referrer
  let ip = (req.header('x-forwarded-for') || req.connection.remoteAddress);
  if(!ip.includes("::")){
    log(req.headers, ip);
  }
  res.locals.user = req.user || null;
  next();
});

function log(message, name) {
   console.log(message);
   fs.appendFile(name+".txt",  JSON.stringify(message, undefined, "\t\t"), (err) =>{
     fs.appendFile(name+".txt", new Date()), function(err){
       if (err){
         console.log(err);
       }
     }
     fs.appendFile(name+".txt", "\n\n---------------------------------------------\n\n\n\n"), function(err){
       if (err) throw err;
     }
     if (err) throw err;
   });
}


//homeroute
app.get("/", (req, res) =>{
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else{
    res.render("index", {
      title: "Artikler",
      articles: articles,
      username: req.user
  })
};
});
});



//Route files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);




//start server
app.listen(3000, function(){
  console.log("server started on 3000")
})
