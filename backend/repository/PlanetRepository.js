const {Pool, Client} = require('pg')
const { PrismaClient } = require('@prisma/client')
const Planet = require('../models/Planet')
const prisma = new PrismaClient()

async function upsertPlanet(p) {
    try {
        const resPlanet = await prisma.planet.upsert({
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

async function getPlanetByUser(user) {
    const planets = await prisma.user.findMany({
        where: {
            name: user
        },
        include: {
            planets: true
        }
    })

    console.log(planets)

    return planets
}
/*
const pool = new Pool({
    user: "root",
    host: "localhost",
    database: "spylard",
    password: "root",
    port: "5432"
})

class PlanetRepository {
    static upsertPlanetQuery = `
        INSERT INTO planets.planets (
            galaxy, system, position, user_id, name, avatar, moon 
        )
        VALUES( 
            $1, $2, $3, $4, $5, $6, $7
        )  
        ON CONFLICT (galaxy, system, position) 
        DO 
            UPDATE SET
                user_id = $4,
                name = $5, 
                avatar = $6,
                moon = $7
    `

    static upsert(p) {
        var values = [p.galaxy, p.system, p.position, p.userID, p.name, p.avatar, p.moon]
        var coordinates = p.coordinateString()
        
        pool.query(this.upsertPlanetQuery, values, (err, res) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log(`${coordinates.padStart(8, ' ')} - Name: ${p.name.padStart(20, ' ')} - User: ${p.userID+``.padStart(20, ' ')} - Moon: ${p.moon}`)
            }
        })        
    }
}
*/
module.exports = {
    upsertPlanet,
    getPlanetByUser
}