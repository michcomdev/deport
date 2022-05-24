import Services from '../../models/Services'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/services',
        options: {
            description: 'get all services data',
            notes: 'return all data from services',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let services = await Services.find().lean()
                    return services
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
        path: '/api/serviceSingle',
        options: {
            description: 'get one service',
            notes: 'get one service',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let service = await Services.findById(payload.id)
                    return service

                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    id: Joi.string()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/serviceUpdate',
        options: {
            description: 'modify service',
            notes: 'modify service',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload

                    let services = await Services.find({
                        _id: { $ne: payload.id },
                        name: payload.name
                    })
                    if(services.length>0){
                        return 'created'
                    }

                    let service = await Services.findById(payload.id)

                    service.name = payload.name
                    service.net = payload.net
                    service.days = payload.days

                    const response = await service.save()

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
                    id: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    net: Joi.number().optional().allow(0),
                    days: Joi.number().optional().allow(0)
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/serviceSave',
        options: {
            description: 'create service',
            notes: 'create service',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   

                    let services = await Services.find({name: payload.name})

                    if(services.length>0){
                        return 'created'
                    }

                    let service = new Services({
                        name: payload.name,
                        net: payload.net,
                        days: payload.days
                    })

                    const response = await service.save()

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
                    name: Joi.string().optional().allow(''),
                    net: Joi.number().optional().allow(0),
                    days: Joi.number().optional().allow(0)
                })
            }
        }
    },
]