const Resource = require('../models/resource');
const User = require('../models/user');
const db = require('../database/bigmood-final');
var admin = require('../app');

module.exports = function (app) {

  //ROOT ROUTE
  //https://stackoverflow.com/questions/39277670/how-to-find-random-record-in-mongoose
  app.get('/', function (req, res) {
    const currentUser = req.user;
    Resource.count().exec(function (err, count) {
      // "Get a random entry"
      var random = Math.floor(Math.random() * count)
      // "Again query all users but only fetch one offset by our random #""
      Resource.findOne().skip(random).exec(
        function (err, result) {
          // "Tada! random user"
          console.log(result)
          res.render('landing', {
            resource: result,
            currentUser
          });
        });
    });
  });

  // NEW resource form
  app.get('/resources/new', function (req, res) {
    const currentUser = req.user;
    console.log(currentUser)
    res.render('resources-new', {
      currentUser
    });
  });

  // CREATE NEW resource
  app.post('/resources/new', function (req, res) {
    Resource.create(req.body).then(function (resource) {
      resource.save()
      console.log(resource)
      res.redirect('/')
    }).catch(function (err) {
      console.log(err.message)
    })
  });

  // REDIRECT if user tries to save w/o being logged-in
  app.get('/loginError', function (req, res) {
    const currentUser = req.user;
    console.log(currentUser)
    res.render('loginError', {
      currentUser
    });
  });

  // CREATE list of favorites!
  app.post('/user/favorites/:id', function (req, res) {
    const currentUser = req.user;
    Resource.findById(req.params.id)
      .then(function (resource) {
        User.findById(currentUser)
          .then(function (user) {
            // JM: This works sometimes. Seems to have something to do with the asynchronicity of node callbacks. Need a promise or something.
            user.likedContent.unshift(resource);
            user.save()
              .then(function () {
                res.redirect(`/user/favorites/`);
              })
          })
      }).catch(function (err) {
        console.log(err);
      });
  });

  // SHOW list of favorites! Woo hoo
  app.get('/user/favorites', function (req, res) {
    const currentUser = req.user;
    if (currentUser) {
      User.findById(currentUser)
        .then(function (currentUser) {
          console.log(currentUser)
          res.render('list', {
            currentUser
          });
        })
    } else {
      return res.status(401); // unauthorized
    }
  })

  // ADMIN USER ONLY
  // SHOW A single resource
  app.get('/resources/:id', function (req, res) {
    const currentUser = req.user;
    // find resource
    Resource.findById(req.params.id).then(function (resource) {
        res.render('resources-show-admin', {
          resource: resource,
          currentUser
        })
      })
      .catch(function (err) {
        console.log(err.message)
      });
  });

  // ADMIN USER ONLY
  // see all to EDIT
  app.get('/index', function (req, res) {
    const currentUser = req.user;
    Resource.find()
      .then(function (resources) {
        res.render('resources-index', {
          resources: resources,
          currentUser
        });
      })
      .catch(function (err) {
        console.log(err);
      })
  });

  // ADMIN USER ONLY
  // EDIT a resource by clicking on the edit link in the shown resource
  // CK: EDIT yields the FORM to make changes to an existing item
  app.get('/resources/:id/edit', function (req, res) {
    const currentUser = req.user;
    Resource.findById(req.params.id, function (err, resource) {
      res.render('resources-edit', {
        resource: resource,
        currentUser
      });
    })
  });

  // ADMIN USER ONLY
  // UPDATE the resource with edits
  app.put('/resources/:id', function (req, res) {
    Resource.findByIdAndUpdate(req.params.id, req.body).then(function (resource) {
        res.redirect('/index');
      })
      .catch(function (err) {
        console.log(err.message)
      })
  });

  // ADMIN USER ONLY
  // DELETE one resource from the delete button on the "shown" resource page
  app.delete(`/resources/:id`, function (req, res) {
    console.log("DELETE resource")
    Resource.findByIdAndRemove(req.params.id).then(function (resource) {
      res.redirect('/index');
    }).catch(function (err) {
      console.log(err.message);
    })
  });
  // app.post('/:resourceId', (req, res) => {
  //   var currentUser = req.user;
  //   const save = req.originalUrl
  //   const saved = save.substring(1)
  //   // console.log(db)
  //   // const save = window.location.href
  //   // const save = document.URL;
  //   // const save = req.resource._id
  //   // console.log(save)
  //   db.currentUser.update(null, {
  //     $push: {
  //       likedContent: saved
  //     }
  //   })
  //   res.render('moods_home/angry', {
  //     resource: currentUser
  //   });
  // });
};



// CK: Was working with Betsy on this - sidelining for now
// app.get('/moods/:mood', function (req, res) {
//   Resource.find({
//     moods: {
//       $all: [req.params.mood]
//     }
//   }).then(function (resources) {
//     console.log(resources)
//     res.render('mood-resource-index', {
//       resources: resources,
//       mood: req.params.mood
//     });
//   }).catch(function (err) {
//     console.log(err.message);
//   });
// });
