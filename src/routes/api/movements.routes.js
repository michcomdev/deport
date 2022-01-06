import Movement from '../../models/Movement'
import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/movements',
        options: {
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Movement.find().lean()
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
                    let movements = await Movement.find().lean()
                    let clients = await Client.find().lean()
                    let containerTypes = await ContainerTypes.find().lean()

                    let movementsTable = movements.reduce((acc, el, i) => {

                        acc.push({
                            id: el._id.toString(),
                            datetime: el.datetime,
                            movement: el.movement,
                            //client: el.client,
                            client: clients.find(cli => cli._id.toString() === el.client).name,
                            containerInitials: el.containerInitials,
                            containerNumber: el.containerNumber,
                            //containerType: el.containerType,
                            containerType: (el.containerType==0) ? 'GENÉRICO' : containerTypes.find(ct => ct._id.toString() === el.containerType).name,
                            containerLarge: el.containerLarge,
                            position: el.position,
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
                        client: payload.client,
                        code: payload.code,
                        containerInitials: payload.containerInitials,
                        containerNumber: payload.containerNumber,
                        containerType: payload.containerType,
                        containerLarge: payload.containerLarge,
                        crane: payload.crane,
                        site: payload.site,
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
                    containerLarge: Joi.string().optional().allow(''),
                    crane: Joi.string().optional().allow(''),
                    site: Joi.string().optional().allow(''),
                    position: Joi.string().optional().allow(''),
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
        path: '/api/movementUpdate',
        options: {
            description: 'create movement',
            notes: 'create movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   
                    
                    let movement = await Movement.findById(payload.id)

                    if (movement) {
                        movement.movement = payload.movement,
                        movement.datetime = payload.datetime,
                        movement.client = payload.client,
                        movement.code = payload.code,
                        movement.containerInitials = payload.containerInitials,
                        movement.containerNumber = payload.containerNumber,
                        movement.containerType = payload.containerType,
                        movement.containerLarge = payload.containerLarge,
                        movement.crane = payload.crane,
                        movement.site = payload.site,
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
                    containerLarge: Joi.string().optional().allow(''),
                    crane: Joi.string().optional().allow(''),
                    site: Joi.string().optional().allow(''),
                    position: Joi.string().optional().allow(''),
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