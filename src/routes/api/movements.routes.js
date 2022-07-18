import Containers from '../../models/Containers'
import Parameters from '../../models/Parameters'
//import Client from '../../models/Client'
import ContainerTypes from '../../models/ContainerTypes'
import Drivers from '../../models/Drivers'
import Logs from '../../models/Logs'
import Joi from 'joi'
import dotEnv from 'dotenv'
import nodemailer from 'nodemailer'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/movements',
        options: {
            auth: false,
            description: 'get all movements data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let movements = await Containers.find().lean().populate(['clients','sites','cranes','containertypes'])
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
        path: '/api/movementsTable',
        options: {
            description: 'get all movements data with associated data',
            notes: 'return all data from movements',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let query = {
                        movements : { 
                            $elemMatch : { 
                                datetime: {
                                    $gt: `${payload.startDate}T00:00:00.000`,
                                    $lt: `${payload.endDate}T23:59:59.999`
                                }
                            } 
                        }
                    }

                    let containers = await Containers.find(query).populate(['clients','containertypes'])
                    
                    let movementsTable = containers.reduce((acc, el, i) => {

                        let lastMov = el.movements.length - 1
                        acc.push({
                            id: el._id.toString(),
                            datetime: el.movements[lastMov].datetime,
                            movementID: lastMov,
                            movement: el.movements[lastMov].movement,
                            client: el.clients.name,
                            containerNumber: el.containerNumber,
                            containerType: el.containertypes.name,
                            containerLarge: el.containerLarge,
                            position: el.movements[lastMov].position.row + el.movements[lastMov].position.position + '_' + el.movements[lastMov].position.level,
                            driverName: el.movements[lastMov].driverName,
                            driverPlate: el.movements[lastMov].driverPlate
                        })
                
                        return acc
                    }, [])

                    /*let movementsTable = containers.reduce((acc, el, i) => {
                        for(let i=0;i<el.movements.length;i++){
                            acc.push({
                                id: el._id.toString(),
                                datetime: el.movements[i].datetime,
                                movementID: i,
                                movement: el.movements[i].movement,
                                client: el.clients.name,
                                containerNumber: el.containerNumber,
                                containerType: el.containertypes.name,
                                containerLarge: el.containerLarge,
                                position: el.movements[i].position.row + el.movements[i].position.position + '_' + el.movements[i].position.level,
                                driverName: el.movements[i].driverName,
                                driverPlate: el.movements[i].driverPlate
                            })
                        }
                    
                        return acc
                    }, [])*/
                        

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
        path: '/api/movementsMap',
        options: {
            auth: false,
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
                        'movements.position.row': 'ascending',
                        'movements.position.position': 'ascending',
                        'movements.position.level': 'ascending'
                    }
                    
                    let containers = await Containers.find().sort(sort)
                    //let containers = await Containers.find()
                    containers = containers.reduce((acc, el, i) => {
                        let lastMov = el.movements.length - 1
                        if(el.movements[lastMov].movement!='SALIDA' && el.movements[lastMov].movement!='TRASPASO'){
                            acc.push({
                                id: 0,
                                row: el.movements[lastMov].position.row,
                                position: el.movements[lastMov].position.position,
                                level: el.movements[lastMov].position.level,
                                large: el.containerLarge,
                                texture: el.containerTexture
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
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementSingle',
        options: {
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
                    let movement = await Containers.findById(payload.id).populate(['clients','services.services'])
                    

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
        path: '/api/movementsByFilter',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let query = {}
                    let status = ''

                    if(!payload.onlyInventory){
                        if(!payload.dateOut){
                            query.movements = { 
                                $elemMatch : { 
                                    datetime: {
                                        $gt: `${payload.startDate}T00:00:00.000`, //`${payload.startDate}T00:00:00.000Z`,
                                        $lt: `${payload.endDate}T23:59:59.999` //`${payload.endDate}T23:59:59.999Z`
                                    }
                                } 
                            }
                        }else{
                            query.movements = { 
                                $elemMatch : { 
                                    datetime: {
                                        $gt: `${payload.startDate}T00:00:00.000`, //`${payload.startDate}T00:00:00.000Z`,
                                        $lt: `${payload.endDate}T23:59:59.999` //`${payload.endDate}T23:59:59.999Z`
                                    },
                                    $or: [
                                        { movement: 'POR SALIR' },
                                        { movement: 'SALIDA' }
                                    ]
                                } 
                            }
                        }

                        if(payload.status){
                            if(payload.status!='TODOS'){
                                status = payload.status
                            }
                        }
                        
                    }
                    
                    if(payload.containerNumber){
                        if(payload.containerNumber!=''){
                            query.containerNumber = new RegExp(payload.containerNumber, 'i') //i se aplica para case insensitive
                        }
                    }

                    if(payload.client){
                        if(payload.client!=''){
                            query.clients = payload.client
                        }
                    }

                    //let movement = await Movement.find(query)
                    let containers = await Containers.find(query).populate(['clients','containertypes','movements.sites','movements.cranes','services.services'])

                    if(payload.table){
                        containers = containers.reduce((acc, el, i) => {

                            /////SERVICIOS/////
                            let containerState = 'N/A'
                            if(el.services.find(x => x.services.name == 'Almacenamiento Vacío') || el.services.find(x => x.services.name == 'Desconsolidado')){
                                containerState = 'VACÍO'
                            }else if(el.services.find(x => x.services.name == 'Almacenamiento Full') || el.services.find(x => x.services.name == 'Almacenamiento IMO')){
                                containerState = 'LLENO'
                            }
/*
                            if(el.clients.rut=='11.111.111-1'){
                                if(el.clients.rates){
                                    if(el.clients.rates.length>0){
                                        for(let j=0; j<el.clients.rates.length; j++){
                                            if(el.services.find(x => x.services._id.toString() == el.clients.rates[j].services.toString())){
                                                console.log(el.services.find(x => x.services._id.toString() == el.clients.rates[j].services.toString()).services.days)
                                                console.log(el.clients.rates[j].days)

                                                el.services.find(x => x.services._id.toString() == el.clients.rates[j].services.toString()).services.clientDays = el.clients.rates[j].days
                                                el.services.find(x => x.services._id.toString() == el.clients.rates[j].services.toString()).services.days = el.clients.rates[j].days
                                            }
                                        }
                                    }
                                }
                            }
*/
                            let lastMov = el.movements.length - 1

                            let site = 'N/A'
                            if(el.movements[lastMov].sites){
                                site = el.movements[lastMov].sites.name
                            }
                            let position = 'N/A'
                            if(el.movements[lastMov].position.row){
                                position = el.movements[lastMov].position.row + el.movements[lastMov].position.position + '_' + el.movements[lastMov].position.level
                            }

                            if(el.movements[lastMov].movement=='SALIDA'){
                                if(site=='N/A'){
                                    if(el.movements[lastMov-1].sites){
                                        site = el.movements[lastMov-1].sites.name
                                    }
                                }

                                if(position=='N/A'){
                                    if(el.movements[lastMov-1].position.row){
                                        position = el.movements[lastMov-1].position.row + el.movements[lastMov-1].position.position + '_' + el.movements[lastMov-1].position.level
                                    }
                                }
                            }

                            let datetimeIn = '-'
                            let datetimeOut = '-'
                            if(el.movements[lastMov].movement=='SALIDA' || el.movements[lastMov].movement=='POR SALIR'){
                                datetimeIn = el.movements[0].datetime //Modificar por último "ingreso"
                                datetimeOut = el.movements[lastMov].datetime
                            }else if(el.movements[lastMov].movement=='TRASPASO'){
                                datetimeIn = el.movements[lastMov].datetime
                                datetimeOut = el.movements[lastMov].datetime
                            }else if(el.movements[lastMov].movement=='DESCONSOLIDADO'){
                                datetimeIn = el.movements[0].datetime //Modificar por último "ingreso"
                                datetimeOut = '-'
                            }else{
                                //datetimeIn = el.movements[lastMov].datetime
                                datetimeIn = el.movements[0].datetime
                                datetimeOut = '-' //Modificar por 5 días y/o +extras
                            }

                            let driverName = '', driverPlate = ''
                            if(el.movements[lastMov].driverName){
                                driverName = el.movements[lastMov].driverName
                                driverPlate = el.movements[lastMov].driverPlate
                            }else{
                                for(let i=el.movements.length-1; i>=0; i--){
                                    if(el.movements[i].driverName){
                                        driverName = el.movements[i].driverName
                                        driverPlate = el.movements[i].driverPlate
                                        i=0
                                    }
                                }
                            }

                            if(status==''){
                                if(payload.onlyInventory){
                                    if(el.movements[lastMov].movement!='SALIDA' && el.movements[lastMov].movement!='TRASPASO'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }
                                }else{
                                    if(el.movements[lastMov].movement=='SALIDA'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }else{
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }
                                }
                            }else{
                                if(payload.onlyInventory || status=='EN SITIO'){
                                    if(el.movements[lastMov].movement!='SALIDA' && el.movements[lastMov].movement!='TRASPASO'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }
                                }else if(status=='RETIRADO'){
                                    if(el.movements[lastMov].movement=='SALIDA'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })

                                    }else if(el.movements[lastMov].movement=='TRASPASO'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }
                                }else{
                                    if(el.movements[lastMov].movement==status){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            clientRates: el.clients.rates,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: driverName,
                                            driverPlate: driverPlate,
                                            services: el.services,
                                            payments: el.payments,
                                            paymentCredit: el.paymentCredit,
                                            movements: el.movements
                                        })
                                    }
                                }
                            }
                    
                            return acc
                        }, [])
                    }
                    
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
                    table: Joi.boolean().required(),
                    containerNumber: Joi.string().optional().allow(''),
                    client: Joi.string().optional().allow(''),
                    status: Joi.string().optional().allow(''),
                    startDate: Joi.string().required(),
                    endDate: Joi.string().required(),
                    dateOut: Joi.boolean().required(),
                    onlyInventory: Joi.boolean().required()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementsByContainerNumber',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let query = {}
                    let status = ''

                    query.containerNumber = new RegExp(payload.containerNumber, 'i') //i se aplica para case insensitive

                    let containers = await Containers.find(query).populate(['clients','containertypes','movements.sites','movements.cranes','services.services'])

                    if(payload.table){
                        containers = containers.reduce((acc, el, i) => {

                            /////SERVICIOS/////
                            let containerState = 'N/A'
                            if(el.services.find(x => x.services.name == 'Almacenamiento Vacío') || el.services.find(x => x.services.name == 'Desconsolidado')){
                                containerState = 'VACÍO'
                            }else if(el.services.find(x => x.services.name == 'Almacenamiento Full') || el.services.find(x => x.services.name == 'Almacenamiento IMO')){
                                containerState = 'LLENO'
                            }
                            let lastMov = el.movements.length - 1

                            let site = 'N/A'
                            if(el.movements[lastMov].sites){
                                site = el.movements[lastMov].sites.name
                            }
                            let position = 'N/A'
                            if(el.movements[lastMov].position.row){
                                position = el.movements[lastMov].position.row + el.movements[lastMov].position.position + '_' + el.movements[lastMov].position.level
                            }

                            if(el.movements[lastMov].movement=='SALIDA'){
                                if(site=='N/A'){
                                    if(el.movements[lastMov-1].sites){
                                        site = el.movements[lastMov-1].sites.name
                                    }
                                }

                                if(position=='N/A'){
                                    if(el.movements[lastMov-1].position.row){
                                        position = el.movements[lastMov-1].position.row + el.movements[lastMov-1].position.position + '_' + el.movements[lastMov-1].position.level
                                    }
                                }
                            }

                            let datetimeIn = '-'
                            let datetimeOut = '-'
                            if(el.movements[lastMov].movement=='SALIDA' || el.movements[lastMov].movement=='POR SALIR'){
                                datetimeIn = el.movements[0].datetime //Modificar por último "ingreso"
                                datetimeOut = el.movements[lastMov].datetime
                            }else if(el.movements[lastMov].movement=='TRASPASO'){
                                datetimeIn = el.movements[lastMov].datetime
                                datetimeOut = el.movements[lastMov].datetime
                            }else if(el.movements[lastMov].movement=='DESCONSOLIDADO'){
                                datetimeIn = el.movements[0].datetime //Modificar por último "ingreso"
                                datetimeOut = '-'
                            }else{
                                //datetimeIn = el.movements[lastMov].datetime
                                datetimeIn = el.movements[0].datetime
                                datetimeOut = '-' //Modificar por 5 días y/o +extras
                            }

                            let driverName = '', driverPlate = ''
                            if(el.movements[lastMov].driverName){
                                driverName = el.movements[lastMov].driverName
                                driverPlate = el.movements[lastMov].driverPlate
                            }else{
                                for(let i=el.movements.length-1; i>=0; i--){
                                    if(el.movements[i].driverName){
                                        driverName = el.movements[i].driverName
                                        driverPlate = el.movements[i].driverPlate
                                        i=0
                                    }
                                }
                            }

                            if(el.movements[lastMov].movement=='SALIDA'){
                                acc.push({
                                    id: el._id.toString(),
                                    datetime: datetimeIn,
                                    datetimeOut: datetimeOut,
                                    movementID: lastMov,
                                    movement: el.movements[lastMov].movement,
                                    client: el.clients.name,
                                    clientRates: el.clients.rates,
                                    containerNumber: el.containerNumber,
                                    containerType: el.containertypes.name,
                                    containerLarge: el.containerLarge,
                                    containerState: containerState,
                                    site: site,
                                    position: position,
                                    driverName: driverName,
                                    driverPlate: driverPlate,
                                    services: el.services,
                                    payments: el.payments,
                                    paymentCredit: el.paymentCredit,
                                    movements: el.movements
                                })
                            }else{
                                acc.push({
                                    id: el._id.toString(),
                                    datetime: datetimeIn,
                                    datetimeOut: datetimeOut,
                                    movementID: lastMov,
                                    movement: el.movements[lastMov].movement,
                                    client: el.clients.name,
                                    clientRates: el.clients.rates,
                                    containerNumber: el.containerNumber,
                                    containerType: el.containertypes.name,
                                    containerLarge: el.containerLarge,
                                    containerState: containerState,
                                    site: site,
                                    position: position,
                                    driverName: driverName,
                                    driverPlate: driverPlate,
                                    services: el.services,
                                    payments: el.payments,
                                    paymentCredit: el.paymentCredit,
                                    movements: el.movements
                                })
                            }
                    
                            return acc
                        }, [])
                    }
                    
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
                    table: Joi.boolean().required(),
                    containerNumber: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementVoucher',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let container = await Containers.findById(payload.id).populate(['clients','containertypes','movements.sites','movements.cranes','services.services'])
                    
                    let movement = {
                        containerNumber: container.containerNumber,
                        containerLarge: container.containerLarge,
                        clientRUT: container.clients.rut,
                        clientName: container.clients.name,
                        clientMail1: container.clients.email,
                        clientMail2: container.clients.email2,
                        clientMail3: container.clients.email3
                    }
                    if(container.numberIn){
                        movement.numberIn = container.numberIn
                    }
                    if(container.numberOut){
                        movement.numberOut = container.numberOut
                    }
                    if(container.transferIn){
                        movement.transferIn = container.transferIn
                    }
                    if(container.transferOut){
                        movement.transferOut = container.transferOut
                    }
                    if(container.numberDecon){
                        movement.numberDecon = container.numberDecon
                    }

                    for(let i=0;i<container.movements.length;i++){
                        let mov = container.movements[i]
                        if(payload.type=='in'){
                            if(mov.movement=='POR INGRESAR' || mov.movement=='INGRESADO'){
                                movement.datetimeIn = mov.datetime
                                movement.driverRUT = mov.driverRUT
                                movement.driverPlate = mov.driverPlate
                                movement.driverGuide = mov.driverGuide
                                movement.driverSeal = mov.driverSeal
                                movement.driverName = mov.driverName
                            }
                        }else if(payload.type=='out'){

                            if(mov.movement=='POR INGRESAR' || mov.movement=='INGRESADO'){
                                if(!movement.datetimeIn){
                                    movement.datetimeIn = mov.datetime
                                }
                            }else if(mov.movement=='POR SALIR' || mov.movement=='SALIDA'){
                                if(!movement.datetimeOut){
                                    movement.datetimeOut = mov.datetime
                                    movement.driverRUT = mov.driverRUT
                                    movement.driverPlate = mov.driverPlate
                                    movement.driverGuide = mov.driverGuide
                                    movement.driverSeal = mov.driverSeal
                                    movement.driverName = mov.driverName
                                }
                            }

                        }else if(payload.type=='transferIn'){
                            movement.datetimeOut = mov.datetime
                            movement.driverRUT = mov.driverRUT
                            movement.driverPlate = mov.driverPlate
                            movement.driverGuide = mov.driverGuide
                            movement.driverSeal = mov.driverSeal
                            movement.driverName = mov.driverName

                        }else if(payload.type=='transferOut'){
                            movement.datetimeOut = mov.datetime
                            movement.driverRUT = mov.driverOutRUT
                            movement.driverPlate = mov.driverOutPlate
                            movement.driverGuide = mov.driverOutGuide
                            movement.driverSeal = mov.driverOutSeal
                            movement.driverName = mov.driverOutName
                        
                        }else if(payload.type=='decon'){
                            if(mov.movement=='DESCONSOLIDADO'){
                                movement.datetimeIn = mov.datetime
                                movement.driverRUT = mov.driverRUT
                                movement.driverPlate = mov.driverPlate
                                movement.driverGuide = mov.driverGuide
                                movement.driverSeal = mov.driverSeal
                                movement.driverName = mov.driverName
                            }
                        }
                    }

                    //////MODIFICAR!!
                    if(payload.type=='decon'){
                        let serv = container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)

                        movement.service = serv.services.name
                        movement.net = serv.paymentNet
                        movement.iva = serv.paymentIVA
                        movement.total = serv.paymentTotal
                    }else{
                        let serv = container.services[0]

                        movement.service = serv.services.name
                        movement.net = serv.paymentNet
                        movement.iva = serv.paymentIVA
                        movement.total = serv.paymentTotal
                    }                    
                    
                    if(container.services.find(x => x.services.name.indexOf('Día(s) Extra'))){

                        movement.extraDays = 0
                        movement.extraDayServiceNet = 0
                        movement.extraDayNet = 0
                        movement.extraDayIva = 0
                        movement.extraDayTotal = 0

                        for(let j=0; j<container.services.length; j++){
                            if(container.services[j].services.name=='Día(s) Extra' || container.services[j].services.name=='Día(s) Extra IMO'){
                                movement.extraDays += container.services[j].extraDays
                                movement.extraDayServiceNet = container.services[j].services.net
                                movement.extraDayNet += container.services[j].paymentNet
                                movement.extraDayIva += container.services[j].paymentIVA
                                movement.extraDayTotal += container.services[j].paymentTotal
                            }
                        }
                    }
                    /*if(container.services[container.services.length-1].services.name=='Día(s) Extra'){
                        movement.extraDays = container.services[container.services.length-1].extraDays
                        movement.extraDayServiceNet = container.services[container.services.length-1].services.net
                        movement.extraDayNet = container.services[container.services.length-1].paymentNet
                        movement.extraDayIva = container.services[container.services.length-1].paymentIVA
                        movement.extraDayTotal = container.services[container.services.length-1].paymentTotal
                    }*/
                    /*for(i=0;container.services.length;i++){
                        if(type=='in'){
                            if(mov.movement=='POR INGRESAR' || mov.movement=='INGRESADO'){
                                movement.datetimeIn = mov.datetime
                                movement.driverPlate = mov.driverPlate
                                movement.driverGuide = mov.driverGuide
                                movement.driverSeal = mov.driverSeal
                                movement.driverName = mov.driverName
                                movement.driverSeal = mov.driverSeal
                            }
                        }
                    }

                        /*id: el._id.toString(),
                        datetime: el.movements[lastMov].datetime,
                        movementID: lastMov,
                        movement: el.movements[lastMov].movement,
                        client: el.clients.name,
                        containerNumber: el.containerNumber,
                        containerType: el.containertypes.name,
                        containerLarge: el.containerLarge,
                        position: el.movements[lastMov].position.row + el.movements[lastMov].position.position + '_' + el.movements[lastMov].position.level,
                        driverName: el.movements[lastMov].driverName,
                        driverPlate: el.movements[lastMov].driverPlate*/
                
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
                    id: Joi.string().required(),
                    type: Joi.string().required()
                })
            }
        }
    },   
    {
        method: 'POST',
        path: '/api/movementSave',
        options: {
            description: 'create movement',
            notes: 'create movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let parameters = await Parameters.findById('623b7fcbc8a7b49a9065708c')
                    let numberIn = parameters.numberIn

                    let credentials = request.auth.credentials

                    let query = {
                        clients: payload.client,
                        containerNumber: payload.containerNumber,
                        containertypes: payload.containerType,
                        containerTexture: payload.containerTexture,
                        containerLarge: payload.containerLarge,
                        numberIn: numberIn,
                        movements: [{
                            users: credentials._id,
                            movement: payload.movement,
                            datetime: payload.datetime,
                            position: payload.position,
                            driverForeigner: payload.driverForeigner,
                            driverRUT: payload.driverRUT,
                            driverName: payload.driverName,
                            driverPlate: payload.driverPlate,
                            driverGuide: payload.driverGuide,
                            driverSeal: payload.driverSeal,
                            paymentAdvance: payload.paymentAdvance,
                            paymentNet: payload.paymentNet,
                            paymentIVA: payload.paymentIVA,
                            paymentTotal: payload.paymentTotal,
                            observation: payload.observation
                        }],
                        services: payload.services,
                        payments: payload.payments,
                        paymentCredit: payload.paymentCredit
                    }
                    
                    let movement = new Containers(query)

                    if(payload.cranes!=0){
                        movement.movements[0].cranes = payload.cranes
                    }
                    if(payload.sites!=0){
                        movement.movements[0].sites = payload.sites
                    }

                    let log = new Logs({
                        users: credentials._id,
                        type: 'saveContainer',
                        data: movement
                    })

                    await log.save()

                    const response = await movement.save()

                    parameters.numberIn++
                    await parameters.save()

                    setDriver(payload.driverRUT,payload.driverName,payload.driverPlate)

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
                    driverForeigner: Joi.boolean().optional(),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    driverGuide: Joi.string().optional().allow(''),
                    driverSeal: Joi.string().optional().allow(''),
                    services: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        //paymentType: Joi.string().optional().allow(''),
                        //paymentNumber: Joi.string().optional().allow(''),
                        //paymentAdvance: Joi.boolean().optional(),
                        paymentNet: Joi.number().allow(0).optional(),
                        paymentIVA: Joi.number().allow(0).optional(),
                        paymentTotal: Joi.number().allow(0).optional()
                        //date: Joi.string().optional().allow('')
                    })),
                    payments: Joi.array().items(Joi.object().keys({
                        paymentType: Joi.string().optional().allow(''),
                        paymentNumber: Joi.string().optional().allow(''),
                        date: Joi.string().optional().allow(''),
                        paymentAmount: Joi.number().allow(0).optional()
                    })),
                    paymentCredit: Joi.boolean().optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementUpdate',
        options: {
            description: 'modify movement',
            notes: 'modify movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let credentials = request.auth.credentials
                    
                    let container = await Containers.findById(payload.id)
                    //let i = payload.movementID

                    
                    if(container){
                        //let i = container.movements.length -1
                        

                        if(payload.client){
                            container.clients = payload.client
                        }
                        if(payload.containerNumber){
                            container.containerNumber = payload.containerNumber
                        }
                        if(payload.containerType){
                            container.containertypes = payload.containerType
                        }
                        if(payload.containerTexture){
                            container.containerTexture = payload.containerTexture
                        }
                        if(payload.containerLarge){
                            container.containerLarge = payload.containerLarge
                        }

                        if(payload.movement == 'POR SALIR' || payload.movement == 'SALIDA'){
                            if(!container.numberOut){
                                let parameters = await Parameters.findById('623b7fcbc8a7b49a9065708c')
                                container.numberOut = parameters.numberOut

                                parameters.numberOut++
                                await parameters.save()
                            }
                        }

                        if(payload.movement == 'DESCONSOLIDADO'){
                            if(!container.numberDecon){
                                let parameters = await Parameters.findById('623b7fcbc8a7b49a9065708c')
                                container.numberDecon = parameters.numberDecon
                                parameters.numberDecon++
                                await parameters.save()
                            }
                        }
                        
                        container.movements.push({
                            users: credentials._id,
                            movement: payload.movement,
                            datetime: payload.datetime,
                            //datetime: Date.now(), //payload.datetime,
                            position: payload.position,
                            driverForeigner: payload.driverForeigner,
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
                            container.services = payload.services
                        }

                        if(payload.payments){
                            container.payments = payload.payments
                        }

                        container.paymentCredit = payload.paymentCredit

                        let lastMov = container.movements.length - 1
                        if(payload.cranes!=0){
                            container.movements[lastMov].cranes = payload.cranes
                        }
                        if(payload.sites!=0){
                            container.movements[lastMov].sites = payload.sites
                        }
    
                    }

                    let log = new Logs({
                        users: credentials._id,
                        type: 'updateContainer',
                        data: container
                    })

                    await log.save()
                    
                    const response = await container.save()

                    setDriver(payload.driverRUT,payload.driverName,payload.driverPlate)

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
                    driverForeigner: Joi.boolean().optional(),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    driverGuide: Joi.string().optional().allow(''),
                    driverSeal: Joi.string().optional().allow(''),
                    services: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        //paymentType: Joi.string().optional().allow(''),
                        //paymentNumber: Joi.string().optional().allow(''),
                        //paymentAdvance: Joi.boolean().optional(),
                        paymentNet: Joi.number().allow(0).optional(),
                        paymentIVA: Joi.number().allow(0).optional(),
                        paymentTotal: Joi.number().allow(0).optional(),
                        extraDays: Joi.number().allow(0).optional()
                        //date: Joi.string().optional().allow('')
                    })),
                    payments: Joi.array().items(Joi.object().keys({
                        paymentType: Joi.string().optional().allow(''),
                        paymentNumber: Joi.string().optional().allow(''),
                        date: Joi.string().optional().allow(''),
                        paymentAmount: Joi.number().allow(0).optional()
                    })),
                    paymentCredit: Joi.boolean().optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementUpdatePosition',
        options: {
            description: 'modify movement position',
            notes: 'modify movement position',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   
                    let credentials = request.auth.credentials
                    
                    let container = await Containers.findById(payload.id)


                    if(container){
                        let i = container.movements.length -1
                        
                        container.movements.push({
                            users: credentials._id,
                            movement: payload.movement,//MOVIMIENTO,//MOVIMIENTO
                            datetime: Date.now(),//FECHA HORA
                            cranes: payload.cranes,//GRÚA
                            sites: payload.sites, //SITIO
                            position: payload.position, //UBICACION
                            driverRUT: container.movements[i].driverRUT,
                            driverName: container.movements[i].driverName,
                            driverPlate: container.movements[i].driverPlate,
                            driverGuide: container.movements[i].driverGuide,
                            driverSeal: container.movements[i].driverSeal,
                            paymentAdvance: container.movements[i].paymentAdvance,
                            paymentNet: container.movements[i].paymentNet,
                            paymentIVA: container.movements[i].paymentIVA,
                            paymentTotal: container.movements[i].paymentTotal,
                            observation: payload.observation //OBSERVACION
                        })
                    }

                    let log = new Logs({
                        users: credentials._id,
                        type: 'updateContainerPosition',
                        data: container
                    })

                    await log.save()

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
        method: 'POST',
        path: '/api/movementSaveTransfer',
        options: {
            description: 'create transfer movement',
            notes: 'create transfer movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload   
                    let credentials = request.auth.credentials

                    let parameters = await Parameters.findById('623b7fcbc8a7b49a9065708c')
                    let movement = new Containers({
                        clients: payload.client,
                        containerNumber: payload.containerNumber,
                        containertypes: payload.containerType,
                        containerTexture: payload.containerTexture,
                        containerLarge: payload.containerLarge,
                        transferIn: parameters.transferIn,
                        transferOut: parameters.transferOut,
                        movements: [{
                            users: credentials._id,
                            movement: payload.movement,
                            datetime: payload.datetime,
                            driverForeigner: payload.driverForeigner,
                            driverRUT: payload.driverRUT,
                            driverName: payload.driverName,
                            driverPlate: payload.driverPlate,
                            driverGuide: payload.driverGuide,
                            driverSeal: payload.driverSeal,
                            driverOutForeigner: payload.driverOutForeigner,
                            driverOutRUT: payload.driverOutRUT,
                            driverOutName: payload.driverOutName,
                            driverOutPlate: payload.driverOutPlate,
                            driverOutGuide: payload.driverOutGuide,
                            paymentAdvance: payload.paymentAdvance,
                            paymentNet: payload.paymentNet,
                            paymentIVA: payload.paymentIVA,
                            paymentTotal: payload.paymentTotal,
                            observation: payload.observation
                        }],
                        services: payload.services,
                        payments: payload.payments,
                        paymentCredit: payload.paymentCredit
                    })

                    if(payload.cranes!=0){
                        movement.movements[0].cranes = payload.cranes
                    }

                    parameters.transferIn++
                    parameters.transferOut++
                    await parameters.save()

                    let log = new Logs({
                        users: credentials._id,
                        type: 'saveContainerTransfer',
                        data: movement
                    })

                    await log.save()

                    const response = await movement.save()

                    setDriver(payload.driverRUT,payload.driverName,payload.driverPlate)
                    setDriver(payload.driverOutRUT,payload.driverOutName,payload.driverOutPlate)

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
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    driverForeigner: Joi.boolean().optional(),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    driverGuide: Joi.string().optional().allow(''),
                    driverSeal: Joi.string().optional().allow(''),
                    driverOutForeigner: Joi.boolean().optional(),
                    driverOutRUT: Joi.string().optional().allow(''),
                    driverOutName: Joi.string().optional().allow(''),
                    driverOutPlate: Joi.string().optional().allow(''),
                    driverOutGuide: Joi.string().optional().allow(''),
                    services: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        //paymentType: Joi.string().optional().allow(''),
                        //paymentNumber: Joi.string().optional().allow(''),
                        //paymentAdvance: Joi.boolean().optional(),
                        paymentNet: Joi.number().allow(0).optional(),
                        paymentIVA: Joi.number().allow(0).optional(),
                        paymentTotal: Joi.number().allow(0).optional(),
                        //date: Joi.string().optional().allow('')
                    })),
                    payments: Joi.array().items(Joi.object().keys({
                        paymentType: Joi.string().optional().allow(''),
                        paymentNumber: Joi.string().optional().allow(''),
                        date: Joi.string().optional().allow(''),
                        paymentAmount: Joi.number().allow(0).optional()
                    })),
                    paymentCredit: Joi.boolean().optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },    
    {
        method: 'POST',
        path: '/api/movementUpdateTransfer',
        options: {
            description: 'modify transfer movement',
            notes: 'modify transfer movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload  
                    let credentials = request.auth.credentials
                    
                    let container = await Containers.findById(payload.id)
                    //let i = payload.movementID

                    if(container){
                        //let i = container.movements.length -1

                        if(payload.client){
                            container.clients = payload.client
                        }
                        
                        container.movements.push({
                            users: credentials._id,
                            movement: payload.movement,
                            datetime: payload.datetime, //Date.now()
                            driverForeigner: payload.driverForeigner,
                            driverRUT: payload.driverRUT,
                            driverName: payload.driverName,
                            driverPlate: payload.driverPlate,
                            driverGuide: payload.driverGuide,
                            driverSeal: payload.driverSeal,
                            driverOutForeigner: payload.driverOutForeigner,
                            driverOutRUT: payload.driverOutRUT,
                            driverOutName: payload.driverOutName,
                            driverOutPlate: payload.driverOutPlate,
                            driverOutGuide: payload.driverOutGuide,
                            //container.services: payload.services,
                            //paymentAdvance: payload.paymentAdvance,
                            //paymentNet: payload.paymentNet,
                            //paymentIVA: payload.paymentIVA,
                            //paymentTotal: payload.paymentTotal,
                            observation: payload.observation
                        })

                        if(payload.services){
                            container.services = payload.services
                            /*container.services.push({
                                services: payload.services,
                                paymentType: payload.paymentType,
                                paymentNumber: payload.paymentNumber,
                                paymentAdvance: payload.paymentAdvance,
                                paymentNet: payload.paymentNet,
                                paymentIVA: payload.paymentIVA,
                                paymentTotal: payload.paymentTotal
                            })*/
                        }

                        if(payload.payments){
                            container.payments = payload.payments
                        }

                        container.paymentCredit = payload.paymentCredit

                        let lastMov = container.movements.length - 1
                        if(payload.cranes!=0){
                            container.movements[lastMov].cranes = payload.cranes
                        }
                    }

                    let log = new Logs({
                        users: credentials._id,
                        type: 'updateContainerTransfer',
                        data: container
                    })

                    await log.save()

                    const response = await container.save()

                    setDriver(payload.driverRUT,payload.driverName,payload.driverPlate)
                    setDriver(payload.driverOutRUT,payload.driverOutName,payload.driverOutPlate)
                    
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
                    containerNumber: Joi.string().optional().allow(''),
                    containerType: Joi.string().optional().allow(''),
                    containerTexture: Joi.string().optional().allow(''),
                    containerLarge: Joi.string().optional().allow(''),
                    cranes: Joi.string().optional().allow(''),
                    driverForeigner: Joi.boolean().optional(),
                    driverRUT: Joi.string().optional().allow(''),
                    driverName: Joi.string().optional().allow(''),
                    driverPlate: Joi.string().optional().allow(''),
                    driverGuide: Joi.string().optional().allow(''),
                    driverSeal: Joi.string().optional().allow(''),
                    driverOutForeigner: Joi.boolean().optional(),
                    driverOutRUT: Joi.string().optional().allow(''),
                    driverOutName: Joi.string().optional().allow(''),
                    driverOutPlate: Joi.string().optional().allow(''),
                    driverOutGuide: Joi.string().optional().allow(''),
                    services: Joi.array().items(Joi.object().keys({
                        services: Joi.string().optional().allow(''),
                        //paymentType: Joi.string().optional().allow(''),
                        //paymentNumber: Joi.string().optional().allow(''),
                        //paymentAdvance: Joi.boolean().optional(),
                        paymentNet: Joi.number().allow(0).optional(),
                        paymentIVA: Joi.number().allow(0).optional(),
                        paymentTotal: Joi.number().allow(0).optional(),
                        //date: Joi.string().optional().allow('')
                    })),
                    payments: Joi.array().items(Joi.object().keys({
                        paymentType: Joi.string().optional().allow(''),
                        paymentNumber: Joi.string().optional().allow(''),
                        date: Joi.string().optional().allow(''),
                        paymentAmount: Joi.number().allow(0).optional()
                    })),
                    paymentCredit: Joi.boolean().optional(),
                    observation: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/api/allContainers',
        options: {
            auth: false,
            description: 'get all containers data',
            notes: 'return all data from containers',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let containers = await Containers.find().distinct('containerNumber')
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
        path: '/api/sendMail',
        options: {
            description: 'modify transfer movement',
            notes: 'modify transfer movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let container = await Containers.findById(payload.id).populate(['clients'])

                    if(isEmail(container.clients.email)){
                        

                        if(isEmail(container.clients.email2)){
                            let response2 = await sendEmail({
                                clientMail: container.clients.email2, 
                                type: payload.type,
                                pdf: payload.pdf,
                                voucher: payload.voucher
                            })
                        }
                        
                        if(isEmail(container.clients.email3)){
                            let response3 = await sendEmail({
                                clientMail: container.clients.email3, 
                                type: payload.type,
                                pdf: payload.pdf,
                                voucher: payload.voucher
                            })
                        }

                        let response = await sendEmail({
                            clientMail: container.clients.email, 
                            type: payload.type,
                            pdf: payload.pdf,
                            voucher: payload.voucher
                        })
                        return response

                    }else{

                        return 'No Email'
                    }

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
                    type: Joi.string().required(),
                    pdf: Joi.string().optional().allow(''),
                    voucher: Joi.object().keys({
                        numberIn: Joi.number().allow(0).optional(),
                        numberOut: Joi.number().allow(0).optional(),
                        numberDecon: Joi.number().allow(0).optional(),
                        transferIn: Joi.number().allow(0).optional(),
                        transferOut: Joi.number().allow(0).optional(),
                        clientName: Joi.string().optional().allow(''),
                        clientMail1: Joi.string().optional().allow(''),
                        clientMail2: Joi.string().optional().allow(''),
                        clientMail3: Joi.string().optional().allow(''),
                        clientRUT: Joi.string().optional().allow(''),
                        containerNumber: Joi.string().optional().allow(''),
                        containerLarge: Joi.string().optional().allow(''),
                        datetimeIn: Joi.string().optional().allow(''),
                        datetimeInMail: Joi.string().optional().allow(''),
                        datetimeOut: Joi.string().optional().allow(''),
                        datetimeOutMail: Joi.string().optional().allow(''),
                        driverGuide: Joi.string().optional().allow(''),
                        driverName: Joi.string().optional().allow(''),
                        driverPlate: Joi.string().optional().allow(''),
                        driverRUT: Joi.string().optional().allow(''),
                        driverSeal: Joi.string().optional().allow(''),
                        service: Joi.string().optional().allow(''),
                        net: Joi.number().allow(0).optional(),
                        iva: Joi.number().allow(0).optional(),
                        total: Joi.number().allow(0).optional(),
                        extraDays: Joi.number().allow(0).optional(),
                        extraDayNet: Joi.number().allow(0).optional(),
                        extraDayIva: Joi.number().allow(0).optional(),
                        extraDayServiceNet: Joi.number().allow(0).optional(),
                        extraDayTotal: Joi.number().allow(0).optional()
                    })
                })
            }
        }
    }
]

//Almacenaje de conductor
async function setDriver(rut,name,plate){

    let driver = await Drivers.find({rut: rut})
    if(driver.length==0){
        let driverNew = new Drivers({
            rut: rut,
            name: name,
            lastPlate: plate
        })

        await driverNew.save()
    }else{

        let driverUpdate = await Drivers.findById(driver[0]._id)
        driverUpdate.name = name
        driverUpdate.lastPlate = plate

        await driverUpdate.save()
    }
}


const sendEmail = async ({ // sendEmail
    clientMail,
    type,
    pdf,
    voucher
}) => {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            /*auth: {
                user: 'elatorre@michcom.cl',
                pass: 'Enzo2021*'
            },*/
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_SENDER_PASSWORD
            },
            tls: {
                // do not fail on invalid certs
                //rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        })

        /*
        let detail = `<tr><td colspan="5">___________________________________</td></tr>
                      <tr><td>Servicio</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.service}</td></tr>
                      <tr><td>Neto</td>           <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.net)}</td></tr>
                      <tr><td>IVA</td>            <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.iva)}</td></tr>
                      <tr><td>Total</td>          <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.total)}</td></tr>`
        if(type=='SALIDA'){
            if(voucher.extraDays){
                detail = `<tr><td colspan="5">___________________________________</td></tr>
                            <tr><td>Servicio</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.service}</td></tr>
                            <tr><td>Neto</td>           <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.net)}</td></tr>
                            <tr><td>IVA</td>            <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.iva)}</td></tr>
                            <tr><td>SubTotal</td>          <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.total)}</td></tr>
                            <tr><td colspan="5">___________________________________</td></tr>
                            <tr><td>Días Extras</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.extraDays} x $ ${dot_separators(voucher.extraDayServiceNet)}</td></tr>
                            <tr><td>Neto</td>           <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.extraDayNet)}</td></tr>
                            <tr><td>IVA</td>            <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.extraDayIva)}</td></tr>
                            <tr><td>SubTotal</td>          <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td style="text-align: right">$ ${dot_separators(voucher.extraDayTotal)}</td></tr>
                            <tr><td colspan="5">___________________________________</td></tr>
                            <tr><td><b>TOTAL</b></td>          <td>&nbsp;</td><td><b>:</b></td><td>&nbsp;</td><td style="text-align: right"><b>$ ${dot_separators(voucher.total+voucher.extraDayTotal)}</b></td></tr>`
            }
        }*/

        let detail = `<tr><td colspan="5">___________________________________</td></tr>
                      <tr><td>Servicio</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.service}</td></tr>`
        if(type=='SALIDA'){
            if(voucher.extraDays){
                detail = `<tr><td colspan="5">___________________________________</td></tr>
                            <tr><td>Servicio</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.service}</td></tr>
                            <tr><td colspan="5">___________________________________</td></tr>
                            <tr><td>Días Extras</td>       <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.extraDays}</td></tr>`
                        }
                    }



        let number = voucher.numberIn

        if(type=='SALIDA'){
            number = voucher.numberOut
        }else if(type=='DESCONSOLIDADO'){
            number = voucher.numberDecon
        }else if(type=='TRASPASO'){
            number = voucher.transferIn
        }

        let mailData = {
            from: process.env.EMAIL_SENDER,
            to: [clientMail],
            subject: `DEPORT - ${type} de Contenedor n° ${voucher.containerNumber}`,
            //text: "Hello world?",
            html: `
                Estimado(a) <b>${voucher.clientName}</b>.
                <br/>
                Se informa el registro de <b>${type}</b> del contenedor número <b>${voucher.containerNumber}</b>, realizado en las dependencias de Depósito Portuario.
                <br/>
                <br/>
                <br/>
                
                <table>
                    <tr><td>N° Voucher</td>     <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${number}</td></tr>
                    <tr><td>Fecha Llegada</td>  <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.datetimeInMail}</td></tr>
                    ${(type=='SALIDA') ? `<tr><td>Fecha Salida</td>   <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.datetimeOutMail}</td></tr>` : ``}
                    <tr><td>Cliente</td>        <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.clientName}</td></tr>
                    <tr><td>RUT</td>            <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.clientRUT}</td></tr>
                    <tr><td>N° Container</td>   <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.containerNumber}</td></tr>
                    <tr><td>Largo</td>          <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.containerLarge}</td></tr>
                    <tr><td>Sello</td>          <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.driverSeal}</td></tr>
                    <tr><td>Guía</td>           <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.driverGuide}</td></tr>
                    <tr><td>Chofer</td>         <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.driverName}</td></tr>
                    <tr><td>RUT Chofer</td>     <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.driverRUT}</td></tr>
                    <tr><td>Patente</td>        <td>&nbsp;</td><td>:</td><td>&nbsp;</td><td>${voucher.driverPlate}</td></tr>
                    ${detail}
                </table>
                
                <br/><br/><br/>
                Este correo ha sido enviado de forma automática, favor no responder
                <br/><br/>
                Depósito Portuario
            `,

            //<img src="cid:logo" />

            /*attachments: [{
                filename: 'logoMail.png',
                path: 'public/img/logoMail.png',
                cid: 'logo' //same cid value as in the html img src
            }]*/
        }

        //mailData.to.push(toEmail)

        /*mailData.attachments = [{
            filename: `Voucher ${type} - Container ${containerNumber}.pdf`,
            content: pdf,
            encoding: 'base64'
        }]*/

        

        let info = await transporter.sendMail(mailData)

        return info
    } catch (error) {
        console.log(error)
        return null
    }
}

const isEmail = (email) => {
    let regexEmail = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/
    return regexEmail.test(email)
}

function dot_separators(num){
    var num_parts = num.toString().split(".")
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return num_parts.join(".")
}