var express = require('express');
var unifi = require('node-unifiapi');
var router = express.Router();
var credentials = require('../credentials');

// Check the credentials_sample
var u = unifi(credentials);

/*
  Using Native Express with Twig
*/
router.get('/native', function(req, res, next) {
  res.render('index', { title: 'My Title' })
});

router.post('/native', function(req, res, next) {
  u.list_guests()
    .then((data) => {
      // remove the hyphen if any
      let voucher = req.body.voucher.replace(/-/g, "");
      // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
      let result = data.data.find(x => x.voucher_code === voucher);
      
      res.render('index', { 
        'voucher_code': req.body.voucher_code,
        'result': result
      })

    })
    .catch((err) => {
      console.log('Error', err);
      res.render('index', { 'error': err });
    })
})

/*
  The API version, if using Angular or React
  in the Frontend
*/
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Welcome to AlwaysOn Bundle Check Page.',
    help: 'To check your AlwaysOn Data Bundle stats, send an API POST method to "/",\
    including the parameter, "voucher_code"\
    So, something like: { "voucher_code": 00000-11111 }'
  })
});

router.post('/', function(req, res, next) {
  u.list_guests()
    .then((data) => {
      // remove the hyphen if any
      let voucher = req.body.voucher.replace(/-/g, "");
      // console.log(data.data.find(x => x.voucher_code === req.body.voucher));
      // find a guest with voucher_code
      let result = data.data.find(x => x.voucher_code === voucher);
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
