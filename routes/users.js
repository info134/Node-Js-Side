const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require("passport");
//bring in Usr model
let User = require('../models/user');

//register form route
router.get('/register', function(req, res){
  res.render('register');
});





// register process
router.post('/register', function(req,res){
  const name =  req.body.name;
  const email =  req.body.email;
  const username =  req.body.username;
  const password =  req.body.password;
  const password2 =  req.body.password2;
  req.checkBody("name", "Skriv navnet ditt").notEmpty();
  req.checkBody("email", "Skriv epost adressen din").isEmail();
  req.checkBody("username", "Skriv brukernavnet ditt").notEmpty();
  req.checkBody("password", "Skriv passordet ditt").notEmpty();
  req.checkBody("password2", "Passordene stemmer ikke").equals(req.body.password);

  let errors = req.validationErrors();
  if(errors){
    res.render('register',{
      errors:errors
    });
  } else{
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
    bcrypt.genSalt(10, function(err,salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else{
            req.flash("success","Du har nå registrert deg " + newUser.name);
            res.redirect("/users/login");
          }
        })
      });
    });
  }

});

//get login page
router.get('/login', function(req, res){
  res.render('login');
});

//get person page
router.get('/person', function(req, res){
  res.render('person');
});

//login post
router.post("/login", function(req, res, next){
  passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect:"/users/login",
    failureFlash: "Ugyldig brukernavn og/eller passord",
    successFlash: "Velkommen! Du er innlogget " + req.body.username
  })(req,res,next)
})


router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Du har blitt logget ut");
  res.redirect("/users/login");
})

module.exports = router;
