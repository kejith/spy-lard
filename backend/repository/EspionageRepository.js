const { Pool, Client } = require('pg')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({log: ['info','warn', 'error'],})


const LevelRessources = 1
const LevelFleet = 2
const LevelDefense = 3
const LevelStructures = 4
const LevelAll = 5

async function create(report) {

    level = report.detailLevel
    espionage = {
        pid: report.id,
        galaxy: report.coords.galaxy,
        system: report.coords.system,
        position: report.coords.position,
        date: report.date,
        detailLevel: report.detailLevel,
        metal: report.ressources.metal,
        crystal: report.ressources.crystal, 
        deuterium: report.ressources.deuterium,
    }
    
    espionage = {...espionage, ...report.ships, ...report.defensive, ...report.strucures, ...report.research}

    updateData = {}
    
    // update planet ressources
    if(level >= LevelRessources)
        updateData = {...report.ressources}

    // update planet fleets
    if(level >= LevelFleet) 
        updateData = {...updateData, ...report.ships}

    // update planet defense
    if(level >= LevelDefense) 
        updateData = {...updateData, ...report.defensive}

    // update planet structures
    if(level >= LevelStructures) 
        updateData = {...updateData, ...report.structures}

    if(level >= LevelAll){
        updateData.user = {
            update: {...report.research}
        }
    }

    if(updateData.satalite) {
        console.error("Somebody is still trying to insert espionages with an old version.")
        return
    }

    return await prisma.$transaction([
        // create espionage
        prisma.espionage.create({ data: espionage }),

        // update planet and users
        prisma.planet.update({
            where: {
                planetPosition: {
                    galaxy: report.coords.galaxy,
                    system: report.coords.system,
                    position: report.coords.position
                }            
            },
            data: updateData
        })        
    ])    
}

function findByIds(ids) {
    return prisma.espionage.findMany({
        where: {
            pid: {
                in: ids
            }
        },
        select: {
            pid: true,
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
    create,
    getMembers,
    findByIds
}