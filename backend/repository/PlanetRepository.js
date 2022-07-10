const { Pool, Client } = require('pg')
const { PrismaClient } = require('@prisma/client')
const Planet = require('../models/Planet')
const UserRepo = require("../repository/UserRepository")
const AllianceRepo = require("../repository/AllianceRepository")
const prisma = new PrismaClient({ log: ['info', 'warn', 'error'], })

async function findMoons(galaxy = undefined) {
    return prisma.planet.findMany({
        where: {
            galaxy: galaxy,
            hasMoon: true
        },
        include: {
            user: true,
        },
        orderBy: [
            { galaxy: 'asc' },
            { system: 'asc' },
            { position: 'asc' }
        ],
        include: {
            user: {
                include: {
                    alliance: true
                }
            }
        }
    })
}

async function upsertSystem(galaxy, system, planets) {
    var promises = []
    planets.forEach(planet => {
        if (planet) {
            const data = { galaxy, system, ...planet }
            if (data.userID !== undefined) {
                promises.push(upsertPlanet(data))

                var userData = {
                    inactive: data.inactive,
                    umode: data.umode,              
                }

                if (data.alliance !== "") {
                    userData.alliance =  {
                        connect: {
                            id: data.alliance.id
                        }
                    }
                }

                promises.push(prisma.user.update({
                    where: { id: data.userID },
                    data: userData
                }))
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
                    position: planet.position,
                    planetType: "planet"
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
    
    if (typeof p.alliance === 'object') {
        allianceUpsert = {
            connectOrCreate: {
                where: { id: p.alliance.id },
                create: { id: p.alliance.id, name: p.alliance.name },
            }
        }
        
    }
    
    var userUpsert = {
        connectOrCreate: {
            where: { id: p.userID },
            create: { id: p.userID, name: p.user, inactive: p.inactive, umode: p.umode, alliance: allianceUpsert },
        },
    }
    
    var moon = undefined
    if(p.hasMoon) {
        var moon = {
            create: {
                galaxy: p.galaxy,
                system: p.system,
                position: p.position,
                name: "Moon",
                hasMoon: false,
                avatar: "",
                planetType: "moon",
                user: userUpsert,
            }
        }
    }

    return pris.planet.upsert({
        where: {
            planetPosition: {
                galaxy: p.galaxy,
                system: p.system,
                position: p.position,
                planetType: "planet"
            }
        },
        update: {
            name: p.name,
            hasMoon: p.hasMoon,
            avatar: p.avatar,
            moon: moon,
            user: userUpsert,
        },
        create: {
            galaxy: p.galaxy,
            system: p.system,
            position: p.position,
            name: p.name,
            hasMoon: p.hasMoon,
            avatar: p.avatar,
            user: userUpsert,
            moon: moon,
        },
        include: {
            moon: true,
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
    deletePlanets,
    findMoons
}