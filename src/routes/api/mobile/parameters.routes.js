import ContainerTypes from '../../../models/ContainerTypes'
import Sites from '../../../models/Sites'
import Cranes from '../../../models/Cranes'
import Maps from '../../../models/Maps'
import Services from '../../../models/Services'
import Parameters from '../../../models/Parameters'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/mobile/containerTypes',
        options: {
            auth: 'jwt',
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
        path: '/api/mobile/sites',
        options: {
            auth: 'jwt',
            description: 'get all sites data',
            notes: 'return all data from sites types',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let sites = await Sites.find().lean()
                    return sites
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
        path: '/api/mobile/cranes',
        options: {
            auth: 'jwt',
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
        path: '/api/mobile/maps',
        options: {
            auth: 'jwt',
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
        path: '/api/mobile/services',
        options: {
            auth: 'jwt',
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
        path: '/api/mobile/parameters',
        options: {
            auth: 'jwt',
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