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
                                    $gt: `${payload.startDate}T00:00:00.000`,
                                    $lt: `${payload.endDate}T23:59:59.999`
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
        path: '/api/reportDaily',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    
                    let query = {}
                    if(payload.type=='IN'){
                        query = {
                            movements : { 
                                $elemMatch : { 
                                    datetime: {
                                        $gt: `${payload.startDate}T00:00:00.000`,
                                        $lt: `${payload.endDate}T23:59:59.999`
                                    },
                                    $or: [
                                        { movement: 'POR INGRESAR' },
                                        { movement: 'INGRESADO' }
                                    ]
                                }
                            }
                        }
                    }else if(payload.type=='OUT'){
                        query = {
                            movements : { 
                                $elemMatch : { 
                                    datetime: {
                                        $gt: `${payload.startDate}T00:00:00.000`,
                                        $lt: `${payload.endDate}T23:59:59.999`
                                    },
                                    $or: [
                                        { movement: 'POR SALIR' },
                                        { movement: 'SALIDA' }
                                    ]
                                }
                            }
                        }
                    }else if(payload.type=='DECON'){
                        query = {
                            movements : { 
                                $elemMatch : { 
                                    datetime: {
                                        $gt: `${payload.startDate}T00:00:00.000`,
                                        $lt: `${payload.endDate}T23:59:59.999`
                                    },
                                    movement: 'DESCONSOLIDADO'
                                }
                            }
                        }
                    }

                    if(payload.client){
                        if(payload.client!=0){
                            query.clients = payload.client
                        }   
                    }
                    
                    let containers = await Containers.find(query).populate(['clients','containertypes','sites','cranes','services.services'])
                    
                    if(payload.type=='DECON'){
                        console.log(containers)
                    }

                    containers = containers.reduce((acc, el, i) => {
                        if(payload.type=='IN'){
                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[0].datetime,
                                movement: el.movements[0].movement,
                                client: el.clients.name,
                                numberIn: el.numberIn,
                                containerNumber: el.containerNumber,
                                containerLarge: el.containerLarge,
                                driverName: el.movements[0].driverName,
                                driverPlate: el.movements[0].driverPlate,
                                driverGuide: el.movements[0].driverGuide,
                                service: el.services[0].services.name,
                                serviceValue: el.services[0].paymentNet
                            })
                        }else if(payload.type=='OUT'){
                            let lastMov = el.movements.length - 1

                            /*if(payload.serviceSelect=='primary'){
                                acc.push({
                                    id: el._id.toString(),
                                    datetime: el.movements[lastMov].datetime,
                                    movement: el.movements[lastMov].movement,
                                    client: el.clients.name,
                                    numberOut: el.numberOut,
                                    containerNumber: el.containerNumber,
                                    containerLarge: el.containerLarge,
                                    driverName: el.movements[lastMov].driverName,
                                    driverPlate: el.movements[lastMov].driverPlate,
                                    driverGuide: el.movements[lastMov].driverGuide,
                                    service: el.services[0].services.name,
                                    serviceValue: el.services[0].paymentNet
                                })

                            }else if(payload.serviceSelect=='separated'){

                                for(i=0; i<el.services.length; i++){

                                    acc.push({
                                        id: el._id.toString(),
                                        datetime: el.movements[lastMov].datetime,
                                        movement: el.movements[lastMov].movement,
                                        client: el.clients.name,
                                        numberOut: el.numberOut,
                                        containerNumber: el.containerNumber,
                                        containerLarge: el.containerLarge,
                                        driverName: el.movements[lastMov].driverName,
                                        driverPlate: el.movements[lastMov].driverPlate,
                                        driverGuide: el.movements[lastMov].driverGuide,
                                        service: el.services[i].services.name,
                                        serviceValue: el.services[i].paymentNet
                                    })
                                }


                            }else */if(payload.serviceSelect=='summary'){
                                let netTotal = 0, totalTotal = 0
                                for(let i=0; i<el.services.length; i++){
                                    netTotal += el.services[i].paymentNet
                                    totalTotal += el.services[i].paymentTotal
                                }

                                let paymentTotal = 0, paymentType = '', paymentDate = el.movements[lastMov].datetime
                                if(el.payments){
                                    for(let j=0; j<el.payments.length; j++){
                                        paymentTotal += el.payments[j].paymentAmount
                                        paymentDate = el.payments[j].date
                                        if(j>0){
                                            paymentType += ' - ' + el.payments[j].paymentType
                                        }else{
                                            paymentType = el.payments[j].paymentType
                                        }
                                    }
                                }
                                
                                let payment = 'Pendiente'
                                if(paymentTotal>0){
                                    if(totalTotal>paymentTotal){
                                        payment = 'Parcial'
                                    }else{
                                        payment = 'Pagado'
                                    }
                                }
                                
                                acc.push({
                                    id: el._id.toString(),
                                    datetime: el.movements[lastMov].datetime,
                                    movement: el.movements[lastMov].movement,
                                    client: el.clients.name,
                                    numberOut: el.numberOut,
                                    containerNumber: el.containerNumber,
                                    containerLarge: el.containerLarge,
                                    driverName: el.movements[lastMov].driverName,
                                    driverPlate: el.movements[lastMov].driverPlate,
                                    driverGuide: el.movements[lastMov].driverGuide,
                                    service: el.services[0].services.name,
                                    serviceValue: netTotal,
                                    payment: payment,
                                    paymentType: paymentType,
                                    paymentDate: paymentDate
                                })
                            }

                        }else if(payload.type=='DECON'){
                            let deconIndex = 0

                            for(let i=0; i<el.movements.length; i++){
                                if(el.movements[i].movement=='DESCONSOLIDADO'){
                                    deconIndex = i
                                }
                            }

                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[deconIndex].datetime,
                                movement: el.movements[deconIndex].movement,
                                client: el.clients.name,
                                numberDecon: el.numberDecon,
                                containerNumber: el.containerNumber,
                                containerLarge: el.containerLarge,
                                driverName: el.movements[deconIndex].driverName,
                                driverPlate: el.movements[deconIndex].driverPlate,
                                driverGuide: el.movements[deconIndex].driverGuide,
                                service: el.services[deconIndex].services.name,
                                serviceValue: el.services[deconIndex].paymentNet
                            })
                        }
                        /*let lastMov = el.movements.length - 1
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
                        }*/
                
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
                    client: Joi.string().optional().allow(''),
                    type: Joi.string().optional().allow(''),
                    startDate: Joi.string().required(),
                    endDate: Joi.string().required(),
                    serviceSelect: Joi.string().required()
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