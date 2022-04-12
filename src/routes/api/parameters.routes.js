import ContainerTypes from '../../models/ContainerTypes'
import Sites from '../../models/Sites'
import Cranes from '../../models/Cranes'
import Maps from '../../models/Maps'
import Services from '../../models/Services'
import dotEnv from 'dotenv'
import Parameters from '../../models/Parameters'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/containerTypes',
        options: {
            description: 'get all container types data',
            notes: 'return all data from container types',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let containerTypes = await ContainerTypes.find().lean()
                    return containerTypes
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
        path: '/api/cranes',
        options: {
            description: 'get all cranes data',
            notes: 'return all data from cranes types',
            tags: ['api'],
            handler: async (request, h) => {
                try {                    
                    let cranes = await Cranes.find().lean()
                    return cranes
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
        path: '/api/maps',
        options: {
            description: 'get all map positions data',
            notes: 'return all data from map positions',
            tags: ['api'],
            handler: async (request, h) => {
                try {                    
                    let maps = await Maps.find().lean()
                    return maps
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
        method: 'GET',
        path: '/api/parameters',
        options: {
            description: 'get all parameters data',
            notes: 'return all data from parameters',
            tags: ['api'],
            handler: async (request, h) => {
                try {                    
                    let parameters = await Parameters.findById('623b7fcbc8a7b49a9065708c')
                    return parameters
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            }
        }
    }
]