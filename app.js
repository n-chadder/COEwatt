const express = require('express');
const app = express();
const port = 3000;
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');

// Automatically parse JSON data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use express.static middleware to make it possible to access files from 
// the ./static directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// Compiled pug templates
const compiledBase              = pug.compileFile('./views/base.pug');
const compiledApplicationList   = pug.compileFile('./views/application_list.pug');
const compiledApplicationDetail = pug.compileFile('./views/application_details.pug');
const compliedLogin             = pug.compileFile('./views/login.pug');

// until we set up a db get dummy data from dummy_data.json
const fs = require('fs');
let rawdata = fs.readFileSync('dummy_data.json');
let apps = JSON.parse(rawdata).applications;

// Not sure if this should exist, here for now, not sure what to show
// as content for here. maybe an few paragraphs explaining what this
// application is
// res.format({}) allows you to check the type of the request that was
// made to the server so we can decide what type of response to send.
// 'application/json' means we recieved a request from an application
// something like postman or an API, in this case we return json data.
// If the request is coming from 'text/html' that means its coming from
// a web browser so we send back the complied pug file with the required
// data. (when pug file is compiled it is compiled into html)
app.get('/', function(req, res) {
  res.format({
    'application/json': function(){
      res.status(200).json();
      return;
    },
    'text/html': function(){
      let page = compiledBase({});
      res.status(200).send(page);
      return;
    }
  });
});


// Path for getting a list of applications existing in the db
app.get('/applications', function(req, res) {
  let applications = apps; // return a object containing the application list
  res.format({
    'application/json': function(){
      res.status(200).json(applications);
      return;
    },
    'text/html': function(){
      let page = compiledApplicationList({applications});
      res.status(200).send(page);
      return;
    }
  });
});

// Get specific application details using application id as the
// request parameter. Uses the app.param({}) function below
app.get('/applications/:applicationID', function(req, res) {
  let application = req.post;
  res.format({
    'application/json': function(){
      res.status(200).json(application);
      return;
    },
    'text/html': function(){
      let page = compiledApplicationDetail({application}); //TO_DO
      res.status(200).send(page);
      return;
    }
  });
});

// Gets the application with the requested app ID
app.param('applicationID', function(req, res, next) {
  // would be replaced with a db query when we have a db
  for (let item = 0; item < apps.length; item++) {
    if (parseInt(req.params.applicationID) == parseInt(apps[item].id)) {
      req.post = apps[item];
      next();
    }
  }
  return;
});

// Path for accessing the web crawler
app.get('/crawler', function(req, res) {
  // TO_DO
  res.format({
    'application/json': function(){
      // do we even allow get requests here?
      // maybe send json instructing how to make
      // a post req with info on what site to crawl?
      // might be unnecessary. 
      return;
    },
    'text/html': function(){
      return;
    }
  });
});

// Path for accessing the accessibility tester
app.get('/tester', function(req, res) {
  // TO_DO
  res.format({
    'application/json': function(){
      // do we even allow get requests here?
      // maybe send json instructing how to make
      // a post req with info on what site to test?
      // probably unnecessary. 
      return;
    },
    'text/html': function(){
      return;
    }
  });
});

app.get('/login', function(req, res) {
  res.format({
    'application/json': function(){
      //
      return;
    },
    'text/html': function(){
      res.status(200).send(compliedLogin({}));
      return;
    }
  });
});

app.post('/login', function(req, res){
  console.log(req.body);
  res.format({
    'application/json': function(){
      //
      return;
    },
    'text/html': function(){
      res.status(200).send(compliedLogin({}));
      return;
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});