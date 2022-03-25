const EspionageRepository = require("../repository/EspionageRepository")
const { createCipheriv } = require("crypto");
const { Prisma } = require("@prisma/client");

// Handle Author create on POST.
exports.create = async function(req, res) {
    success = false
    try {
        await EspionageRepository.create(req.body)
        success = true
    } catch(e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            console.log("Espionage unique constraint violation. Espionage could not be created.")
        } else {
            console.log(e)
        }
    }

    if(success) {
        res.status(200).json("Success")
    } else {
        res.status(400).send("Error");
    }

}

exports.checkIds = async function(req, res) {
    success = false
    try {
        result = await EspionageRepository.findByIds(req.body)
        success = true

        res.status(200).json(result)
    } catch(e) {
        console.error(e)
        res.status(400).json(result)
    }
}