const AllianceRepo = require("../repository/AllianceRepository")
const { createCipheriv } = require("crypto");

// Handle Author create on POST.
exports.getAlliance = async function(req, res) {
    members = await AllianceRepo.getMembers(req.query.tag);

    if(true) {
        res.status(200).json(members)
    } else {
        res.status(400).send("Error");
    }

}