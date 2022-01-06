import ContainerTypes from '../../models/ContainerTypes'
import Sites from '../../models/Sites'
import Cranes from '../../models/Cranes'
import dotEnv from 'dotenv'

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
        path: '/api/sites',
        options: {
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
    }
]