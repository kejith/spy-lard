const {Pool, Client} = require('pg')
const { PrismaClient } = require('@prisma/client')
const Planet = require('../models/Planet')
const prisma = new PrismaClient()

async function upsertSystem(galaxy, system, planets) {
    var promises = []
    planets.forEach(element => {
        if(element) {
            const {userID} = element   
            const data = {galaxy, system, ...element} 

            if(parseInt(userID) && parseInt(userID) != 0){
                try {
                    promises.push(upsertPlanet(data))
                } catch(e) {
                    hadError = true
                    console.error(e)
                }
            }
        }
    })
    

    try {
        var result = await prisma.$transaction(promises)
    } catch(e) {
        hadError = true
        console.error(e)
    }

}

 function upsertPlanet(p) {
    try {
       return prisma.planet.upsert({
            where: {
                planetPosition : {
                    galaxy: p.galaxy,
                    system: p.system,
                    position: p.position
                }
            },
            update: {
                name: p.name,
                moon: p.moon,
                avatar: p.avatar,
                user: {
                    connectOrCreate: {                    
                        create: { id: p.userID, name: p.user },
                        where: { id: p.userID }
                    },
                }   
            },
            create: {
                galaxy: p.galaxy,
                system: p.system,
                position: p.position,
                name: p.name,
                moon: p.moon,
                avatar: p.avatar,
                user: {
                    connectOrCreate: {                    
                        create: { id: p.userID, name: p.user },
                        where: { id: p.userID }
                    },
                }            
            }
        })
    } catch(e) {
        console.log(e)
    }
}

async function findPlanetsByUser(user) {
    const planets = await prisma.user.findMany({
        where: {
            name: {
                contains: user,
                mode: 'insensitive'
            }
        },
        include: {
            planets: true
        }
    })


    return planets
}

async function systemLastModified(galaxy, system) {
    const updatedAt = await prisma.planet.findMany({
        take: 1,
        select: {
            updatedAt: true
        },
        where: {
            galaxy: galaxy,
            system: system
        },
        orderBy: [{updatedAt: 'desc'}],

    })

    if (updatedAt.length > 0) {
        return updatedAt[0]
    } else {
        return ""
    }
}
module.exports = {
    upsertSystem: upsertSystem,
    upsertPlanet,
    findPlanetsByUser,
    systemLastModified,
}