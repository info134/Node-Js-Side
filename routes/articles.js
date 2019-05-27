const express  = require('express');
const router = express.Router();

//bring in article model
let Article = require("../models/article");
// /usr models
let User = require("../models/user");



//Add route
router.get("/add", ensureAuthenticated, function(req,res){
  res.render("add_article", {
    title: "Legg til artikkel"
  });
});

router.get("/gdpr", function(req,res){
  res.render("gdpr", {
    title: "GDPR"
  });
});



//load edit
router.get("/edit/:id", ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err,article){
    if(article.author != req.user._id){
      req.flash("danger", "Du har ikke tilgang din luring");
      return res.redirect("/");
    }
   res.render("edit_article", {
     title:"Rediger artikkel",
     article:article
   });
  });
});



//Add submit POST route
router.post("/add", function(req, res){
  req.checkBody('title','Du må ha en tittel').notEmpty();
  // req.checkBody('author','Du må ha en forfatter').notEmpty();
  req.checkBody('body','Du må skrive innhold').notEmpty();
  // req.checkBody("author","Du har vel ikke tall i navnet ditt?").isString();
  //Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article',{
      title:'Add Article',
      errors:errors
    });
  } else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.save(function(err){
    if(err){
      console.log(err);
      return;
    } else{
      req.flash('success','Artikkel lagt til');
      res.redirect('/');
      }
    });
  }
});

//Update submit edit
router.post("/edit/:id", ensureAuthenticated, function(req, res){
  let article = {};
  article.title = req.body.title;
  // article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}
  Article.updateOne(query, article, function(err){
  if(err){
    console.log(err);
    return;
  } else{
    req.flash("success", "Artikkelen er endret!")
    res.redirect('/');
  }
  });
});

//delete article
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }
  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    }else{
      Article.deleteOne(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash("success", "Artikkelen er slettet!")
        res.send('Success');
      });
    }
  });
});


//Add single article w/author, body and Title
router.get("/:id", ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err,article){
    User.findById(article.author,function(err, user){

      res.render("article", {
        article:article,
        author:user.name
      });
    });
  });
});

//access controls
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash("danger", "Du må logge inn først");
    res.redirect("/users/login");
  }
}

module.exports = router;
