const PlanetRepo = require("../repository/PlanetRepository")
const Planet = require("../models/Planet");
const { createCipheriv } = require("crypto");

// Handle Author create on POST.
exports.galaxy_create_post = function(req, res) {
    const {galaxy, system, planets} = req.body
    var hadError = false

    planets.forEach(element => {
        if(element) {
            const {userID} = element   
            const data = {galaxy, system, ...element} 

            if(parseInt(userID) && parseInt(userID) != 0){
                try {
                    PlanetRepo.upsertPlanet(data)
                } catch(e) {
                    hadError = true
                    console.error(e)
                }
            }
        }
    });

    if(!hadError) {
        res.status(200).send("Success");
    } else {
        res.status(400).send("Error");
    }

};

exports.galaxy_planet_by_user = async function(req, res) {
    const user = req.query.user
    var planets = await PlanetRepo.getPlanetByUser(user)
    res.status(200).json(planets)
}