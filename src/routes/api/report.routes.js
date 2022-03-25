import Containers from '../../models/Containers'
//import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/report',
        options: {
            auth: false,
            description: 'get all report data',
            notes: 'return all data from report',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let inventory = await Containers.find().lean().populate(['clients','sites','cranes','containertypes'])
                    return inventory
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
        path: '/api/reportByFilter',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let query = {
                        clients: payload.client,
                        movements : { 
                            $elemMatch : { 
                                datetime: {
                                    $gt: `${payload.startDate}T00:00:00.000Z`,
                                    $lt: `${payload.endDate}T23:59:59.999Z`
                                }
                            } 
                        }
                    }
                    
                    let containers = await Containers.find(query).populate(['clients','containertypes','sites','cranes','services.services'])


                    containers = containers.reduce((acc, el, i) => {

                        let lastMov = el.movements.length - 1
                        if(el.movements[lastMov].movement!='SALIDA'){
                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[lastMov].datetime,
                                movement: el.movements[lastMov].movement,
                                client: el.clients.name,
                                containerInitials: el.containerInitials,
                                containerNumber: el.containerNumber,
                                containerType: el.containertypes.name,
                                containerLarge: el.containerLarge,
                                position: el.movements[lastMov].position.row + el.movements[lastMov].position.position + '_' + el.movements[lastMov].position.level,
                                driverName: el.movements[lastMov].driverName,
                                driverPlate: el.movements[lastMov].driverPlate
                            })
                        }
                
                        return acc
                    }, [])
                   
                    return containers
                
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    startDate: Joi.string().required(),
                    endDate: Joi.string().required(),
                    client: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/reportMovement',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let movement = await Containers.findById(payload.id).lean().populate(['clients','sites','cranes','containertypes','services.services'])
                    
                    /*let service1 = movement.services.slice().reverse().find(x => x.serviceNumber===1)
                    let service2 = movement.services.slice().reverse().find(x => x.serviceNumber===2)

                    let services = []
                    if(service1){
                        services.push(service1)
                    }
                    if(service2){
                        services.push(service2)
                    }*/


                   
                    //movement.services = services

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
    }
]