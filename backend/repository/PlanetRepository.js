const { Pool, Client } = require('pg')
const { PrismaClient } = require('@prisma/client')
const Planet = require('../models/Planet')
const UserRepo = require("../repository/UserRepository")
const AllianceRepo = require("../repository/AllianceRepository")
const prisma = new PrismaClient({log: [ 'info','warn', 'error'],})

async function findMoons(galaxy) {
    return prisma.planet.findMany({
        where: {
            galaxy: galaxy,
            moon: true
        },
        include: {
            user: true,
        }
    }) 
}

async function upsertSystem(galaxy, system, planets) {
    var promises = []
    planets.forEach( planet => {
        if (planet) {
            const data = { galaxy, system, ...planet }
            if(data.userID !== undefined) {
                promises.push(upsertPlanet(data))

                if(data.alliance !== "") {
                    promises.push(prisma.user.update({
                        where: { id: data.userID },
                        data: {
                            alliance: {
                                connect: {
                                    id: data.alliance.id
                                }
                            }
                        }
                    }))
                }
            }
        }
    })
    
    try {
        await prisma.$transaction(promises)
    } catch (e) {
        console.log(e)
    }
}

async function exists(model, condition) {
    return await model
        .findFirst(condition)
        .then(r => Boolean(r))
}

async function deletePlanets(planets) {
    planets.forEach(async planet => {
        var params = {
            where: {
                planetPosition: {
                    galaxy: planet.galaxy,
                    system: planet.system,
                    position: planet.position
                }          
            }
        }
        console.log(params)
        try {
            await prisma.planet.delete(params)
        } catch (error) {
            console.log(error)
        }
    });
}

function upsertPlanet(p, _prisma = undefined) {
    const pris = (_prisma !== undefined) ? _prisma : prisma 
    var allianceUpsert = undefined
    if (p.alliance != '') {
        var allianceUpsert = {
            connectOrCreate: {
                where: { id: p.alliance.id },
                create: { id: p.alliance.id, name: p.alliance.name },
            }
        }
    }

    var userUpsert = {
        connectOrCreate: {
            where: { id: p.userID },
            create: { id: p.userID, name: p.user, alliance: allianceUpsert },
        },
    }

    return pris.planet.upsert({
        where: {
            planetPosition: {
                galaxy: p.galaxy,
                system: p.system,
                position: p.position
            }
        },
        update: {
            name: p.name,
            moon: p.moon,
            avatar: p.avatar,
        },
        create: {
            galaxy: p.galaxy,
            system: p.system,
            position: p.position,
            name: p.name,
            moon: p.moon,
            avatar: p.avatar,
            user: userUpsert
        },
        include: {
            user: {
                include: {
                    alliance: true
                }
            }
        }
    })
}



async function systemLastModified(galaxy, system) {
    const updatedAt = await prisma.planet.findMany({
        where: {
            galaxy: galaxy,
            system: system
        },
        orderBy: [{ updatedAt: 'desc' }],

    })

    if (updatedAt.length > 0) {
        return updatedAt
    } else {
        return ""
    }
}
module.exports = {
    upsertSystem: upsertSystem,
    upsertPlanet,
    systemLastModified,
    deletePlanets
}