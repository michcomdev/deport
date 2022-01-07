import Movement from '../../models/Movement'
//import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/movements',
        options: {
            auth: false,
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Movement.find().lean().populate(['clients','sites','cranes','containertypes'])
                    return movements
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
        path: '/api/movementsTable',
        options: {
            description: 'get all movements data with associated data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Movement.find().populate(['clients','containertypes'])
                    let movementsTable = movements.reduce((acc, el, i) => {

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


                    return movementsTable
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
        path: '/api/movementsMap',
        options: {
            auth: false,
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Movement.find({movement: 'INGRESO'}).sort({'position.row': 'ascending','position.position': 'ascending','position.level': 'ascending'})
                    movements = movements.reduce((acc, el, i) => {
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

                    return movements
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
        path: '/api/movementSingle',
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
        path: '/api/movementSave',
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
                        services: payload.services,
                        paymentAdvance: payload.paymentAdvance,
                        paymentNet: payload.paymentNet,
                        paymentIVA: payload.paymentIVA,
                        paymentTotal: payload.paymentTotal,
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
                    services: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentNet: Joi.number().allow(0).optional(),
                    paymentIVA: Joi.number().allow(0).optional(),
                    paymentTotal: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementUpdate',
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
                        movement.services = payload.services,
                        movement.paymentAdvance = payload.paymentAdvance,
                        movement.paymentNet = payload.paymentNet,
                        movement.paymentIVA = payload.paymentIVA,
                        movement.paymentTotal = payload.paymentTotal,
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
                    services: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentNet: Joi.number().allow(0).optional(),
                    paymentIVA: Joi.number().allow(0).optional(),
                    paymentTotal: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    }
]