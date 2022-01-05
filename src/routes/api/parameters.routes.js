import ContainerTypes from '../../models/ContainerTypes'
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
                    console.log('here')
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
    }
]