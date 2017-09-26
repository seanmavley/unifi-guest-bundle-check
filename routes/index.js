var express = require('express');
var unifi = require('node-unifiapi');
var router = express.Router();
var recaptcha = require('express-recaptcha');

var credentials = require('../credentials');

recaptcha.init(credentials.sitekey, credentials.sitesecret);

// Homepage
router.get('/', function(req, res, next) {
  res.render('index', {});
});

// Terms
router.get('/terms', function(req, res, next) {
  res.render('terms', {});
})

router.get('/for-home', function(req, res, next) {
  res.render('home', {});
})

router.get('/about', function(req, res, next) {
  res.render('about', {});
})

router.get('/for-business', function(req, res, next) {
  res.render('business', {});
})

router.get('/packages', function(req, res, next) {
  res.render('packages', {});
})

router.get('/faq', function(req, res, next) {
  res.render('faq', {});
})

router.get('/support', function(req, res, next) {
  res.render('support', {});
})

// Page to display after user logged in.
router.get('/logged-in', function(req, res, next) {
  res.render('loggedin', {});
})

router.get('/coverage', function(req, res, next) {
  res.render('coverage', {});
})

// Voucher check begins from here.
router.get('/check-voucher', function(req, res, next) {
  res.render('checkvoucher', {
    captcha: recaptcha.render()
  })
});

function calculate_usage(result) {
  /*
    Calculates the amount of data used and left as per voucher.
    
    Convert all values to Megabyte
    1 Megabyte = 1000000 (a million) bytes
  */
  console.log(result.bytes);
  console.log(result.rx_bytes);
  console.log(result.tx_bytes);
  console.log(result.qos_usage_quota);
  var total_used = (result.rx_bytes + result.tx_bytes) / 1000000;
  var total_left = result.qos_usage_quota - total_used;

  return {
    'quota': result.qos_usage_quota,
    'total_used': total_used,
    'total_left': total_left
  }
}


router.post('/check-voucher', function(req, res, next) {
  // Check the credentials_sample
  var u = unifi({
    baseUrl: credentials.baseUrl, // The URL of the Unifi Controller
    username: credentials.username, // Your username
    password: credentials.password, // Your password
    // debug: true
  });

  recaptcha.verify(req, function(error) {
    if (!error) {
      u.list_guests()
        .then((data) => {
          // remove the hyphen if any
          var voucher = req.body.voucher_code.replace(/-/g, "");
          // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
          var result = data.data.find(x => x.voucher_code === voucher);

          var data = calculate_usage(result);

          res.render('checkvoucher', {
            'result': true,
            'voucher_code': req.body.voucher_code,
            'quota': data.quota,
            'total_used': data.total_used,
            'total_left': data.total_left
          })
        })
        .catch(err => {
          console.log('Error', err)
          res.render('checkvoucher', {
            'error': err,
            'captcha': recaptcha.render()
          });
        })

    } else {
      res.render('checkvoucher', {
        'error': error,
        'captcha': recaptcha.render()
      })
    }
  })

})

module.exports = router;
