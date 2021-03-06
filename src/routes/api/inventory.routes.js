import Containers from '../../models/Containers'
//import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/inventory',
        options: {
            auth: false,
            description: 'get all inventory data',
            notes: 'return all data from inventory',
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
        method: 'GET',
        path: '/api/inventoryTable',
        options: {
            description: 'get all inventory data with associated data',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let query = {
                        movements : { 
                            $elemMatch : { 
                                movement: ['POR INGRESAR','INGRESADO','INGRESADO PENDIENTE','TRASLADO','POR RETIRAR','RETIRADO PENDIENTE']

                            } 
                        }
                    }
                    let inventory = await Containers.find(query).populate(['clients','containertypes'])
                    let inventoryTable = inventory.reduce((acc, el, i) => {

                        let lastMov = el.movements.length - 1
                        if(el.movements[lastMov].movement!='SALIDA'){
                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[lastMov].datetime,
                                movement: el.movements[lastMov].movement,
                                client: el.clients.name,
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


                    return inventoryTable
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
        path: '/api/inventoryMap',
        options: {
            auth: false,
            description: 'get all inventory data',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let inventory = await Containers.find().sort({'position.row': 'ascending','position.position': 'ascending','position.level': 'ascending'})
                    inventory = inventory.reduce((acc, el, i) => {
                        acc.push({
                            id: 0,
                            row: el.position.row,
                            position: el.position.position,
                            level: el.position.level,
                            large: el.containerLarge,
                            texture: el.containerTexture
                        })
                
                        return acc
                    }, [])

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
        path: '/api/inventorySiteMap',
        options: {
            auth: false,
            description: 'get all inventory data from site',
            notes: 'return all data from inventory',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let sort = {
                        'movements.position.row': 'ascending',
                        'movements.position.position': 'ascending',
                        'movements.position.level': 'ascending'
                    }
                    
                    let containers = await Containers.find({'movements.sites': payload.id}).populate(['clients','containertypes']).sort(sort)
                    containers = containers.reduce((acc, el, i) => {
                        let lastMov = el.movements.length - 1
                        if(el.movements[lastMov].movement!='SALIDA' && el.movements[lastMov].movement!='TRASPASO'){
                            acc.push({
                                container: el,
                                movement: el.movements[lastMov]
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
                    id: Joi.string().required()
                })
            }
        }
    }
]