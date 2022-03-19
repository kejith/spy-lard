class Planet {
    constructor(galaxy, system, position, name, userID, moon, avatar){
        this.galaxy = galaxy
        this.system = system
        this.position = position
        this.name = name
        this.userID = userID
        this.moon = moon,
        this.avatar = avatar
    }

    coordinateString() {
        return `${this.galaxy}:${this.system}:${this.position}`
    }
}

module.exports = Planet