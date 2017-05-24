var express = require('express');
var unifi = require('node-unifiapi');
var router = express.Router();
var recaptcha = require('express-recaptcha');

var credentials = require('../credentials');

// Check the credentials_sample
var u = unifi({
  baseUrl: credentials.baseUrl, // The URL of the Unifi Controller
  username: credentials.username,
  password: credentials.password,
});

recaptcha.init(credentials.sitekey, credentials.sitesecret);

// Homepage
router.get('/', function(req, res, next) {
  res.render('index', {});
});

// Terms
router.get('/terms', function(req, res, next) {
  res.render('terms', {});
})

// Page to display after user logged in.
router.get('/logged-in', function(req, res, next) {
  res.render('loggedin', {});
})

// Voucher check begins from here.
router.get('/check-voucher', function(req, res, next) {
  res.render('checkvoucher', {
    captcha: recaptcha.render()
  })
});

router.post('/check-voucher', function(req, res, next) {
  recaptcha.verify(req, function(error) {
    if (!error) {
      u.list_guests()
        .then((data) => {
          // remove the hyphen if any
          var voucher = req.body.voucher_code.replace(/-/g, "");
          // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
          var result = data.data.find(x => x.voucher_code === voucher);

          res.render('checkvoucher', {
            'voucher_code': req.body.voucher_code,
            'result': result
          })

        })
        .catch((err) => {
          console.log('Error', err);
          res.render('checkvoucher', { 'error': err });
        })
    } else {
      res.render('checkvoucher', { 'error': error })
    }
  })

})

/*
  The API version, if using Angular or React
  in the Frontend
*/
router.get('/api', function(req, res, next) {
  res.json({
    message: 'Welcome to AlwaysOn Bundle Check Page.',
    help: 'To check your AlwaysOn Data Bundle stats, send an API POST method to "/",\
    including the parameter, "voucher_code"\
    So, something like: { "voucher_code": 00000-11111 }'
  })
});

router.post('/api', function(req, res, next) {
  u.list_guests()
    .then((data) => {
      // remove the hyphen if any
      var voucher = req.body.voucher.replace(/-/g, "");
      // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
      // find a guest with voucher_code
      var result = data.data.find(x => x.voucher_code === voucher);
      res.json({
        'response': result,
        'voucher': voucher
      });
    })
    .then((data) => {
      console.log('AP data', data);
    })
    .catch((err) => {
      console.log('Error', err);
    })
})

module.exports = router;
