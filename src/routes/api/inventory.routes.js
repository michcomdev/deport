import Movement from '../../models/Movement'
//import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/inventory',
        options: {
            auth: false,
            description: 'get all inventory data',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let inventory = await Movement.find().lean().populate(['clients','sites','cranes','containertypes'])
                    return inventory
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/inventoryTable',
        options: {
            description: 'get all inventory data with associated data',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let inventory = await Movement.find().populate(['clients','containertypes'])
                    let inventoryTable = inventory.reduce((acc, el, i) => {

                        acc.push({
                            id: el._id.toString(),
                            datetime: el.datetime,
                            movement: el.movement,
                            client: el.clients.name,
                            containerInitials: el.containerInitials,
                            containerNumber: el.containerNumber,
                            containerType: el.containertypes.name,
                            containerLarge: el.containerLarge,
                            position: el.position.row + el.position.position + '_' + el.position.level,
                            driverName: el.driverName,
                            driverPlate: el.driverPlate
                        })
                
                        return acc
                    }, [])


                    return inventoryTable
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/inventoryMap',
        options: {
            auth: false,
            description: 'get all inventory data',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let inventory = await Movement.find().sort({'position.row': 'ascending','position.position': 'ascending','position.level': 'ascending'})
                    inventory = inventory.reduce((acc, el, i) => {
                        acc.push({
                            id: 0,
                            row: el.position.row,
                            position: el.position.position,
                            level: el.position.level,
                            large: el.containerLarge,
                            texture: el.containerTexture
                        })
                
                        return acc
                    }, [])

                    return inventory
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/inventoryingle',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   

                    /*var mongo = require('mongodb');
                    let movement = await Movement.findOne({
                        _id: new mongo.ObjectID(payload.id)
                    }).lean()*/
                    let movement = await Movement.findById(payload.id)

                    return movement
                
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    id: Joi.string().required()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/inventoryave',
        options: {
            description: 'create movement',
            notes: 'create movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   
                    let movement = new Movement({
                        movement: payload.movement,
                        datetime: payload.datetime,
                        clients: payload.client,
                        code: payload.code,
                        containerInitials: payload.containerInitials,
                        containerNumber: payload.containerNumber,
                        containertypes: payload.containerType,
                        containerTexture: payload.containerTexture,
                        containerLarge: payload.containerLarge,
                        cranes: payload.cranes,
                        sites: payload.sites,
                        position: payload.position,
                        driverRUT: payload.driverRUT,
                        driverName: payload.driverName,
                        driverPlate: payload.driverPlate,
                        paymentAdvance: payload.paymentAdvance,
                        paymentValue: payload.paymentValue,
                        observation: payload.observation
                    })

                    const response = await movement.save()

                    return response

                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    movement: Joi.string().optional().allow(''),
                    datetime: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow(''),
                    code: Joi.string().optional().allow(''),
                    containerInitials: Joi.string().optional().allow(''),
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    sites: Joi.string().optional().allow(''),
                    position: Joi.object().keys({
                        row: Joi.string().optional().allow(''),
                        position: Joi.number().allow(0).optional(),
                        level: Joi.number().allow(0).optional()
                    }),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentValue: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/inventoryUpdate',
        options: {
            description: 'modify movement',
            notes: 'modify movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   
                    
                    let movement = await Movement.findById(payload.id)

                    if (movement) {
                        movement.movement = payload.movement,
                        movement.datetime = payload.datetime,
                        movement.clients = payload.client,
                        movement.code = payload.code,
                        movement.containerInitials = payload.containerInitials,
                        movement.containerNumber = payload.containerNumber,
                        movement.containertypes = payload.containerType,
                        movement.containerTexture = payload.containerTexture,
                        movement.containerLarge = payload.containerLarge,
                        movement.cranes = payload.cranes,
                        movement.sites = payload.sites,
                        movement.position = payload.position,
                        movement.driverRUT = payload.driverRUT,
                        movement.driverName = payload.driverName,
                        movement.driverPlate = payload.driverPlate,
                        movement.paymentAdvance = payload.paymentAdvance,
                        movement.paymentValue = payload.paymentValue,
                        movement.observation = payload.observation
                    }

                    await movement.save()
                    
                    const response = await movement.save()

                    return response

                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    id: Joi.string().required(),
                    movement: Joi.string().optional().allow(''),
                    datetime: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow(''),
                    code: Joi.string().optional().allow(''),
                    containerInitials: Joi.string().optional().allow(''),
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    sites: Joi.string().optional().allow(''),
                    position: Joi.object().keys({
                        row: Joi.string().optional().allow(''),
                        position: Joi.number().allow(0).optional(),
                        level: Joi.number().allow(0).optional()
                    }),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentValue: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    }
]