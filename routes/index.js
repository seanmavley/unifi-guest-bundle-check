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

function calculate_usage(result) {
  /*
    Calculates the amount of data used and left as per voucher.
    
    Convert all values to Megabyte
    1 Megabyte = 1000000 (a million) bytes
  */
  var total_used = (result.rx_bytes + result.tx_bytes) / 1000000
  var total_left = result.qos_usage_quota - total_used;

  return {
    'quota': result.qos_usage_quota,
    'total_used': total_used,
    'total_left': total_left
  }
}

router.post('/check-voucher', function(req, res, next) {
  recaptcha.verify(req, function(error) {
    if (!error) {
      u.login(credentials.username, credentials.password)
        .then(data => {
          console.log('success', data)
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
            .catch((err) => {
              console.log('Error', err);
              res.render('checkvoucher', {
                'error': err,
                'captcha': recaptcha.render()
              });
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
      res.render('checkvoucher', { 'error': error }, {
        'captcha': recaptcha.render()
      })
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
  if (!req.body.voucher_code) {
    res.json({
      'Error': 'No "voucher_code"',
      'message': 'You did not send the voucher_code param'
    })
  } else {
    u.list_guests()
      .then((data) => {
        // remove the hyphen if any
        var voucher = req.body.voucher_code.replace(/-/g, "");

        var result = data.data.find(x => x.voucher_code === voucher);

        var data = calculate_usage(result);

        res.json({
          'voucher_code': req.body.voucher_code,
          'quota': data.quota,
          'total_used': data.total_used,
          'total_left': data.total_left
        });
      })
      .catch((err) => {
        console.log('Error', err);
        res.json({
          'Error': err
        })
      })
  }
})

module.exports = router;
