import Containers from '../../../models/Containers'
//import Client from '../../../models/Client'
// import ContainerTypes from '../../../models/ContainerTypes'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/mobile/movements',
        options: {
            auth: 'jwt',
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Containers.find().populate(['clients', 'containertypes', 'movements.cranes', 'movements.sites', 'services.services'])
                    return movements
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
        path: '/api/mobile/movementsTable',
        options: {
            auth: 'jwt',
            description: 'get all movements data with associated data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let query = {
                        movements: {
                            $elemMatch: {
                                datetime: {
                                    $gt: `${payload.startDate}T00:00:00.000Z`,
                                    $lt: `${payload.endDate}T23:59:59.999Z`
                                }
                            }
                        }
                    }

                    let containers = await Containers.find(query).populate(['clients', 'containertypes'])
                    let movementsTable = containers.reduce((acc, el) => {
                        for (let i = 0; i < el.movements.length; i++) {
                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[i].datetime,
                                movementID: i,
                                movement: el.movements[i].movement,
                                client: el.clients.name,
                                containerInitials: el.containerInitials,
                                containerNumber: el.containerNumber,
                                containerType: el.containertypes.name,
                                containerLarge: el.containerLarge,
                                position: el.movements[i].position.row + el.movements[i].position.position + '_' + el.movements[i].position.level,
                                driverName: el.movements[i].driverName,
                                driverPlate: el.movements[i].driverPlate
                            })
                        }

                        return acc
                    }, [])


                    return movementsTable
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
                    endDate: Joi.string().required()
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/api/mobile/movementsMap',
        options: {
            auth: 'jwt',
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    //let containers = await Containers.find({movement: 'INGRESO'}).sort({'position.row': 'ascending','position.position': 'ascending','position.level': 'ascending'})
                    /*let sort = {
                        movements : {
                            $sort : {
                                'position.row': 'ascending',
                                'position.position': 'ascending',
                                'position.level': 'ascending'
                            }
                        }
                    }*/

                    let sort = {
                        'movement.position.row': 'ascending',
                        'movement.position.position': 'ascending',
                        'movement.position.level': 'ascending'
                    }

                    let containers = await Containers.find().sort(sort)
                    //let containers = await Containers.find()
                    containers = containers.reduce((acc, el) => {
                        let lastMov = el.movements.length - 1
                        acc.push({
                            id: 0,
                            row: el.movements[lastMov].position.row,
                            position: el.movements[lastMov].position.position,
                            level: el.movements[lastMov].position.level,
                            large: el.containerLarge,
                            texture: el.containerTexture
                        })

                        return acc
                    }, [])

                    return containers
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
        path: '/api/mobile/movementSingle',
        options: {
            auth: 'jwt',
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    /*var mongo = require('mongodb');
                    let movement = await Movement.findOne({
                        _id: new mongo.ObjectID(payload.id)
                    }).lean()*/
                    let movement = await Containers.findById(payload.id)


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
    },
    {
        method: 'POST',
        path: '/api/mobile/movementsByFilter',
        options: {
            auth: 'jwt',
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                console.log(request.payload)
                try {
                    let payload = request.payload
                    let query = {}

                    if (payload.containerNumber) {
                        if (payload.containerNumber != '') {
                            query.containerNumber = new RegExp(payload.containerNumber, 'i') //i se aplica para case insensitive
                        }
                    }

                    if (payload.client) {
                        if (payload.client != '') {
                            query.clients = payload.client
                        }
                    }

                    //let movement = await Movement.find(query)
                    let containers = await Containers.find(query).populate(['clients', 'containertypes', 'movements.sites', 'movements.cranes', 'services.services'])

                    containers = containers.reduce((acc, el) => {
                        
                        let lastMov = el.movements.length - 1

                        if(el.movements[lastMov].movement=='SALIDA'){

                            let i=1
                            while (i<=el.movements.length) {
                                if(el.movements[lastMov-i].movement!='SALIDA'){
                                    el.movements[lastMov].driverRUT = el.movements[lastMov-i].driverRUT
                                    el.movements[lastMov].driverName = el.movements[lastMov-i].driverName
                                    el.movements[lastMov].driverPlate = el.movements[lastMov-i].driverPlate
                                    i = el.movements.length+1
                                }else{
                                    i++
                                }
                            }
                        }

                        acc.push(el)
                        
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
                    containerNumber: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/mobile/movementSave',
        options: {
            auth: 'jwt',
            description: 'create movement',
            notes: 'create movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let movement = new Containers({
                        clients: payload.client,
                        containerInitials: payload.containerInitials,
                        containerNumber: payload.containerNumber,
                        containertypes: payload.containerType,
                        containerTexture: payload.containerTexture,
                        containerLarge: payload.containerLarge,
                        movements: [{
                            movement: payload.movement,
                            datetime: payload.datetime,
                            code: payload.code,
                            cranes: payload.cranes,
                            sites: payload.sites,
                            position: payload.position,
                            driverRUT: payload.driverRUT,
                            driverName: payload.driverName,
                            driverPlate: payload.driverPlate,
                            paymentAdvance: payload.paymentAdvance,
                            paymentNet: payload.paymentNet,
                            paymentIVA: payload.paymentIVA,
                            paymentTotal: payload.paymentTotal,
                            observation: payload.observation
                        }],
                        services: [{
                            services: payload.services,
                        }]
                    })

                    const response = await movement.save()

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
                    movement: Joi.string().optional().allow(''),
                    datetime: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow(''),
                    code: Joi.string().optional().allow(''),
                    containerInitials: Joi.string().optional().allow(''),
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    sites: Joi.string().optional().allow(''),
                    position: Joi.object().keys({
                        row: Joi.string().optional().allow(''),
                        position: Joi.number().allow(0).optional(),
                        level: Joi.number().allow(0).optional()
                    }),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    services: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentNet: Joi.number().allow(0).optional(),
                    paymentIVA: Joi.number().allow(0).optional(),
                    paymentTotal: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/mobile/movementUpdate',
        options: {
            auth: 'jwt',
            description: 'modify movement',
            notes: 'modify movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let container = await Containers.findById(payload.id)
                    //let i = payload.movementID

                    console.log('original', container)

                    if(container){
                        //let i = container.movements.length -1
                        
                        container.movements.push({
                            movement: payload.movement,
                            datetime: Date.now(), //payload.datetime,
                            position: payload.position,
                            driverRUT: payload.driverRUT,
                            driverName: payload.driverName,
                            driverPlate: payload.driverPlate,
                            driverGuide: payload.driverGuide,
                            driverSeal: payload.driverSeal,
                            //container.services: payload.services,
                            paymentAdvance: payload.paymentAdvance,
                            paymentNet: payload.paymentNet,
                            paymentIVA: payload.paymentIVA,
                            paymentTotal: payload.paymentTotal,
                            observation: payload.observation
                        })

                        if(payload.services){
                            container.services.push({
                                services: payload.services,
                                paymentType: payload.paymentType,
                                paymentNumber: payload.paymentNumber,
                                paymentAdvance: payload.paymentAdvance,
                                paymentNet: payload.paymentNet,
                                paymentIVA: payload.paymentIVA,
                                paymentTotal: payload.paymentTotal
                            })
                        }

                        let lastMov = container.movements.length - 1
                        if(payload.cranes!=0){
                            container.movements[lastMov].cranes = payload.cranes
                        }
                        if(payload.sites!=0){
                            container.movements[lastMov].sites = payload.sites
                        }
    
                    }

                    console.log('after', container)


                    /*if (container) {
                        container.movements[i].movement = payload.movement,
                        container.movements[i].datetime = payload.datetime,
                        container.clients = payload.client,
                        container.movements[i].code = payload.code,
                        container.containerInitials = payload.containerInitials,
                        container.containerNumber = payload.containerNumber,
                        container.containertypes = payload.containerType,
                        container.containerTexture = payload.containerTexture,
                        container.containerLarge = payload.containerLarge,
                        container.movements[i].cranes = payload.cranes,
                        container.movements[i].sites = payload.sites,
                        container.movements[i].position = payload.position,
                        container.movements[i].driverRUT = payload.driverRUT,
                        container.movements[i].driverName = payload.driverName,
                        container.movements[i].driverPlate = payload.driverPlate,
                        //container.services = payload.services,
                        container.movements[i].paymentAdvance = payload.paymentAdvance,
                        container.movements[i].paymentNet = payload.paymentNet,
                        container.movements[i].paymentIVA = payload.paymentIVA,
                        container.movements[i].paymentTotal = payload.paymentTotal,
                        container.movements[i].observation = payload.observation
                    }*/

                    const response = await container.save()

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
                    id: Joi.string().required(),
                    movementID: Joi.number().allow(0).optional(),
                    movement: Joi.string().optional().allow(''),
                    datetime: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow(''),
                    code: Joi.string().optional().allow(''),
                    containerInitials: Joi.string().optional().allow(''),
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    sites: Joi.string().optional().allow(''),
                    position: Joi.object().keys({
                        row: Joi.string().optional().allow(''),
                        position: Joi.number().allow(0).optional(),
                        level: Joi.number().allow(0).optional()
                    }),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    services: Joi.string().optional().allow(''),
                    paymentAdvance: Joi.boolean().optional(),
                    paymentNet: Joi.number().allow(0).optional(),
                    paymentIVA: Joi.number().allow(0).optional(),
                    paymentTotal: Joi.number().allow(0).optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/mobile/movementOut',
        options: {
            auth: 'jwt',
            description: 'modify movement',
            notes: 'modify movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let container = await Containers.findById(payload.id)

                    if(container){
                        
                        container.movements.push({
                            movement: payload.movement,
                            datetime: Date.now(), //payload.datetime,
                            cranes: payload.cranes,
                            observation: payload.observation
                        })
    
                    }

                    const response = await container.save()

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
                    id: Joi.string().required(),
                    movement: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/mobile/movementUpdatePosition',
        options: {
            auth: 'jwt',
            description: 'modify movement position',
            notes: 'modify movement position',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let container = await Containers.findById(payload.id)


                    if (container) {
                        let i = container.movements.length - 1

                        container.movements.push({
                            movement: payload.movement,//MOVIMIENTO,//MOVIMIENTO
                            datetime: Date.now(),//FECHA HORA
                            code: container.movements[i].code,
                            cranes: payload.cranes,//GRÚA
                            sites: payload.sites, //SITIO
                            position: payload.position, //UBICACION
                            driverRUT: container.movements[i].driverRUT,
                            driverName: container.movements[i].driverName,
                            driverPlate: container.movements[i].driverPlate,
                            paymentAdvance: container.movements[i].paymentAdvance,
                            paymentNet: container.movements[i].paymentNet,
                            paymentIVA: container.movements[i].paymentIVA,
                            paymentTotal: container.movements[i].paymentTotal,
                            observation: payload.observation //OBSERVACION
                        })
                    }

                    const response = await container.save()

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
                    id: Joi.string().required(),
                    movement: Joi.string().optional().allow(''),
                    datetime: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    sites: Joi.string().optional().allow(''),
                    position: Joi.object().keys({
                        row: Joi.string().optional().allow(''),
                        position: Joi.number().allow(0).optional(),
                        level: Joi.number().allow(0).optional()
                    }),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/api/mobile/containersPending',
        options: {
            auth: 'jwt',
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Containers.find({"movements.movement": "POR INGRESAR"}).populate(['clients', 'containertypes', 'movements.cranes', 'movements.sites', 'services.services'])
                    return movements
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
        path: '/api/mobile/containersPendingOut',
        options: {
            auth: 'jwt',
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Containers.find({"movements.movement": "POR SALIR"}).populate(['clients', 'containertypes', 'movements.cranes', 'movements.sites', 'services.services'])
                    return movements
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
        path: '/api/mobile/inventorySiteMap',
        options: {
            auth: 'jwt',
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
                    
                    let containers = await Containers.find({'movements.sites': payload.id}).populate(['movements.sites','clients','containertypes','movements.cranes']).sort(sort)
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