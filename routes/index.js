var express = require('express');
var unifi = require('node-unifiapi');
var router = express.Router();
var Recaptcha = require('express-recaptcha');

var credentials = require('../credentials');

let recaptcha = new Recaptcha(credentials.sitekey, credentials.sitesecret);

// Homepage
router.get('/', function(req, res, next) {
  res.render('index', {});
});

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

function calculate_usage(result, voucher_code) {

    //   Calculates the amount of data used and left as per voucher.

    //   Convert all values to Megabyte
    //   1 Megabyte = 1000000 (a million) bytes

    // console.log(result.bytes);
    // console.log(result.rx_bytes);
    // console.log(result.tx_bytes);
    // console.log(result.qos_usage_quota);
    let total_used = (result.rx_bytes + result.tx_bytes) / 1000000;
    let total_left = result.qos_usage_quota - total_used;
    let expiry_date = new Date(result.end * 1000);
    let activated_on = new Date(result.start * 1000);

    return {
        'result': true,
        'voucher_code': voucher_code,
        'quota': result.qos_usage_quota,
        'total_used': total_used,
        'total_left': total_left,
        'activated_on': activated_on,
        'expiry_date': expiry_date,
    }
}


router.post('/check-voucher', function(req, res) {
    // Check the credentials_sample
    let u = unifi({
        baseUrl: credentials.baseUrl, // The URL of the Unifi Controller
        username: credentials.username, // Your username
        password: credentials.password, // Your password
        // debug: true
    });

    recaptcha.verify(req, function(error) {
        if (!error) {
            u.list_guests()
                .then((unifi_response) => {
                    // remove the hyphen if any
                    let voucher = req.body.voucher_code.replace(/-/g, "");
                    // console.log(unifi_response.data.find(x => x.voucher_code === req.body.voucher));
                    let result = unifi_response.data.find(x => x.voucher_code === voucher);

                    let calculations = calculate_usage(result, req.body.voucher_code);

                    res.render('checkvoucher', calculations)
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
