var express = require('express');
var router = express.Router();

var galaxyController = require('../controllers/galaxyController');

router.post("/system/update", galaxyController.galaxy_create_post);
router.get("/system/planets", galaxyController.galaxy_planet_by_user)
router.get("/system/", galaxyController.get_system)

module.exports = router;

