let express = require('express');
let unifi = require('node-unifiapi');
let router = express.Router();
let Recaptcha = require('express-recaptcha');
let nodemailer = require('nodemailer');
let credentials = require('../credentials');

let recaptcha = new Recaptcha(credentials.sitekey, credentials.sitesecret);
let smtpTransport = nodemailer.createTransport(credentials.emailConfig);

router.get('/', function(req, res) {
    res.render('index', {});
});

router.get('/terms', function(req, res) {
    res.render('terms', {});
})

router.get('/privacy', function(req, res) {
    res.render('privacy', {});
})

router.get('/for-home', function(req, res) {
    res.render('home', {});
})

router.get('/about', function(req, res) {
    res.render('about', {});
})

router.get('/for-business', function(req, res) {
    res.render('business', {});
})

router.get('/packages', function(req, res) {
    res.render('packages', {});
})

router.get('/faq', function(req, res) {
    res.render('faq', {});
})

router.get('/support', function(req, res) {
    res.render('support', {
        captcha: recaptcha.render(),
        'success': false
    })
})

router.post('/support', function(req, res) {
    if (!(req.body.email || req.body.message)) {
      return res.render('support', {
        'error': true,
        'msg': 'Please complete the form'
      })
    };

    recaptcha.verify(req, function(error) {
        if (!error) {
            let mailOptions = {
                from: 'noreply@khophi.co',
                to: 'nkansahrexford@gmail.com',
                subject: `${req.body.subject} with email address ${req.body.email}`,
                html: `${req.body.name} says: "${req.body.message}" with email address: ${req.body.email}`
            };

            smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) {
                  console.log(error);
                } else {
                  console.log(response);
                }
            });

            // send response ahead of time
            // trusting email will send.
            res.render('support', {
              'state': true,
              'msg': 'Message successfully sent. We will get in touch as soon as possible.'
            })

        } else {
            res.render('checkvoucher', {
                'error': error,
                'captcha': recaptcha.render()
            })
        }
    })
})

// Page to display after user logged in.
router.get('/logged-in', function(req, res) {
    res.render('loggedin', {});
})

router.get('/coverage', function(req, res) {
    res.render('coverage', {});
})

// Voucher check begins from here.
router.get('/check-voucher', function(req, res) {
    res.render('checkvoucher', {
        captcha: recaptcha.render()
    })
});

function calculate_usage(result) {

    //   Calculates the amount of data used and left as per voucher.

    //   Convert all values to Megabyte
    //   1 Megabyte = 1000000 (a million) bytes

    // console.log(result.bytes);
    // console.log(result.rx_bytes);
    // console.log(result.tx_bytes);
    // console.log(result.qos_usage_quota);
    let total_used = (result.rx_bytes + result.tx_bytes) / 1000000;
    let total_left = result.qos_usage_quota - total_used;

    return {
        'quota': result.qos_usage_quota,
        'total_used': total_used,
        'total_left': total_left
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
                    // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
                    let result = unifi_response.data.find(x => x.voucher_code === voucher);

                    let calculations = calculate_usage(result);

                    res.render('checkvoucher', {
                        'result': true,
                        'voucher_code': req.body.voucher_code,
                        'quota': calculations.quota,
                        'total_used': calculations.total_used,
                        'total_left': calculations.total_left
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