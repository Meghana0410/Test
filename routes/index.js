var express = require('express');
var router = express.Router();
var urlControllers = require("../controllers/createURL.js");

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// router.post('/', function (req, res) {
//   res.send('POST request to the homepage')
// })

router
  .route('/shorten')
  .post(urlControllers.shorten)

router
  .route('/*')
  .get(urlControllers.getUrlData)

module.exports = router;
