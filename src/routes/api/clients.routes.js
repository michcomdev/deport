import Client from '../../models/Client'
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
                    let client = await Client.findById(payload.id)

                    client.rut = payload.rut
                    client.name = payload.name
                    client.email = payload.email
                    client.status = payload.status

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
                    email: Joi.string().optional().allow(''),
                    status: Joi.string().optional().allow('')
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
                    
                    /*let clients = await Client.find({rut: payload.rut})
                    if(clients){
                        return false
                    }*/

                    let client = new Client({
                        rut: payload.rut,
                        name: payload.name,
                        email: payload.email,
                        status: payload.status,
                        debt: 'SIN DEUDA'
                    })

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
                    email: Joi.string().optional().allow(''),
                    status: Joi.string().optional().allow('')
                })
            }
        }
    },
]