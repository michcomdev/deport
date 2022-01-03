import Movement from '../../models/Movement'
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
    }
]