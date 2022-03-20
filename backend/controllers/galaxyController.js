const PlanetRepo = require("../repository/PlanetRepository")
const Planet = require("../models/Planet");
const { createCipheriv } = require("crypto");

// Handle Author create on POST.
exports.galaxy_create_post = function(req, res) {
    const {galaxy, system, planets} = req.body
    var hadError = false

    PlanetRepo.upsertSystem(galaxy, system, planets);

    if(!hadError) {
        res.status(200).send("Success");
    } else {
        res.status(400).send("Error");
    }

};

exports.galaxy_planet_by_user = async function(req, res) {
    const user = req.query.user
    if ( typeof user === "string" &&  user != "" ) {
        var planets = await PlanetRepo.findPlanetsByUser(user)
        res.status(200).json(planets)
    } else {
        res.status(400).send("User is not a String or empty")
    }     
}

exports.get_system = async function(req, res) {
    const galaxy = parseInt(req.query.galaxy)
    const system = parseInt(req.query.system)
    var systemLastModified = await PlanetRepo.systemLastModified(galaxy, system)
    res.status(200).json(systemLastModified)
}