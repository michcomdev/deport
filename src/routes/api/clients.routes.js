import Client from '../../models/Client'
import Logs from '../../models/Logs'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/clients',
        options: {
            description: 'get all clients data',
            notes: 'return all data from clients',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let clients = await Client.find().lean()
                    return clients
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
        path: '/api/clientSingle',
        options: {
            description: 'get one client',
            notes: 'get one client',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let client = await Client.findById(payload.id)
                    return client

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
        path: '/api/clientUpdate',
        options: {
            description: 'modify client',
            notes: 'modify client',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload
                    let credentials = request.auth.credentials

                    let clients = await Client.find({
                        _id: { $ne: payload.id },
                        rut: payload.rut
                    })
                    if(clients.length>0){
                        return 'created'
                    }

                    let client = await Client.findById(payload.id)

                    client.rut = payload.rut
                    client.name = payload.name
                    client.nameFull = payload.nameFull
                    client.email = payload.email
                    client.contact = payload.contact
                    client.contactPhone = payload.contactPhone
                    client.status = payload.status
                    client.credit = payload.credit
                    client.creditLimit = payload.creditLimit
                    client.services = payload.services
                    client.rates = payload.rates

                    let log = new Logs({
                        users: credentials._id,
                        type: 'updateClient',
                        data: client
                    })

                    await log.save()

                    const response = await client.save()

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
                    rut: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    nameFull: Joi.string().optional().allow(''),
                    email: Joi.string().optional().allow(''),
                    contact: Joi.string().optional().allow(''),
                    contactPhone: Joi.string().optional().allow(''),
                    status: Joi.string().optional().allow(''),
                    credit: Joi.boolean().required(),
                    creditLimit: Joi.number().allow(0).optional(),
                    services: Joi.object().keys({
                        storage: Joi.boolean().required(),
                        deconsolidated: Joi.boolean().required(),
                        portage: Joi.boolean().required(),
                        transport: Joi.boolean().required()
                    }),
                    rates: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        net: Joi.number().allow(0).optional()
                    }))
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/clientSave',
        options: {
            description: 'create client',
            notes: 'create client',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let credentials = request.auth.credentials

                    let clients = await Client.find({rut: payload.rut})

                    if(clients.length>0){
                        return 'created'
                    }

                    let client = new Client({
                        rut: payload.rut,
                        name: payload.name,
                        nameFull: payload.nameFull,
                        email: payload.email,
                        contact: payload.contact,
                        contactPhone: payload.contactPhone,
                        status: payload.status,
                        debt: 'SIN DEUDA',
                        credit: payload.credit,
                        creditLimit: payload.creditLimit,
                        services: payload.services,
                        rates: payload.rates
                    })

                    let log = new Logs({
                        users: credentials._id,
                        type: 'saveeClient',
                        data: client
                    })

                    await log.save()

                    const response = await client.save()

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
                    nameFull: Joi.string().optional().allow(''),
                    email: Joi.string().optional().allow(''),
                    contact: Joi.string().optional().allow(''),
                    contactPhone: Joi.string().optional().allow(''),
                    status: Joi.string().optional().allow(''),
                    credit: Joi.boolean().required(),
                    creditLimit: Joi.number().allow(0).optional(),
                    services: Joi.object().keys({
                        storage: Joi.boolean().required(),
                        deconsolidated: Joi.boolean().required(),
                        portage: Joi.boolean().required(),
                        transport: Joi.boolean().required()
                    }),
                    rates: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        net: Joi.number().allow(0).optional()
                    }))
                })
            }
        }
    },
]