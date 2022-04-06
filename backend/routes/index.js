var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/check', function(req, res, next) {
  res.status(200).json({version: '0.5.2'})
});

router.post('/', function(req, res, next) {
  console.log(req.body)
}); 

module.exports = router;
