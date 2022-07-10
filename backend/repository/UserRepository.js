const { Pool, Client } = require('pg')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function upsert(user, _prisma = undefined) {
    const pris = (_prisma !== undefined) ? _prisma : prisma
    var query = {
        where: {
            id: user.id
        },
        update: {
            name: user.name
        },
        create: {
            id: user.id,
            name: user.name
        }
    }


    if (user.alliance) {
        query.create.alliance = { connect: { id: user.alliance.id } }
        query.update.alliance = { connect: { id: user.alliance.id } }
    }

    return pris.user.upsert(query)
}

function update(user, _prisma = undefined) {
    const pris = (_prisma !== undefined) ? _prisma : prisma

    try {
        var updateQuery = {
            where: {
                id: user.id
            }, 
            data: {
                name: user.name,
                alliance: {}
            }
        }

        if (user.alliance.id !== undefined) {
            updateQuery = {
                where: {
                    id: user.id
                },
                data: {
                    name: user.name,
                    alliance: {
                        connect: { id: user.alliance.id }
                    }
                },
                include: {
                    alliance: true,
                }, 
            }

        }

        console.log(updateQuery)
        return pris.user.update(updateQuery)
    } catch (e) { console.log(e) }
}

async function findColonies(user) {
    const planets = await prisma.user.findMany({
        where: {
            name: {
                contains: user,
                mode: 'insensitive'
            }
        },
        include: {
            planets: true, 
            // {
            //     include: {
            //         espionages: true,
            //     }
            // },
            alliance: true
        }
    })


    return planets
}

module.exports = {
    upsert,
    update,
    findColonies
}