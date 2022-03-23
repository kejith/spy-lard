const { Pool, Client } = require('pg')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function upsert(alliance, _prisma = undefined) {
    const pris = (_prisma !== undefined) ? _prisma : prisma 
    return pris.alliance.upsert({
        where: {
            id: alliance.id
        },
        update: {
            name: alliance.name
        },
        create: {
            id: alliance.id,
            name: alliance.name
        }
    })
}

function getMembers(allianceTag, _prisma = undefined) {
    const pris = (_prisma !== undefined) ? _prisma : prisma 
    return pris.alliance.findMany({
        where: { 
            name: { 
                contains: allianceTag,
                mode: 'insensitive'
            } 
        },
        include: {
            users: {
                include: {
                    planets: true
                }
            }
        }
    })
}

module.exports = {
    upsert,
    getMembers
}