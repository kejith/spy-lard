var express = require('express');
var router = express.Router();

var allianceController = require('../controllers/allianceController');

router.get("/", allianceController.getAlliance);

module.exports = router;

