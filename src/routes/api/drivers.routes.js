import Drivers from '../../models/Drivers'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/drivers',
        options: {
            description: 'get all drivers data',
            notes: 'return all data from drivers',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let drivers = await Drivers.find().lean()
                    return drivers
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
        path: '/api/driverSingle',
        options: {
            description: 'get one client',
            notes: 'get one client',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let driver = await Drivers.find({rut: payload.rut})
                    return driver

                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    rut: Joi.string()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/driverUpdate',
        options: {
            description: 'modify driver',
            notes: 'modify driver',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let driver = await Drivers.find({rut: payload.rut})
                    
                    let driverUpdate = await Drivers.findById(driver[0]._id)

                    driverUpdate.rut = payload.rut
                    driverUpdate.name = payload.name
                    driverUpdate.lastPlate = payload.lastPlate

                    const response = await driverUpdate.save()

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
                    rut: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    lastPlate: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/driverSave',
        options: {
            description: 'create driver',
            notes: 'create driver',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   

                    let driver = new Drivers({
                        rut: payload.rut,
                        name: payload.name,
                        lastPlate: payload.lastPlate
                    })

                    const response = await driver.save()

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
                    rut: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    lastPlate: Joi.string().optional().allow('')
                })
            }
        }
    },
]