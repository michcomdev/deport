import Client from '../../models/Client'
import Invoices from '../../models/Invoices'
import Containers from '../../models/Containers'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'POST',
        path: '/api/clientsInvoices',
        options: {
            description: 'get all clients data',
            notes: 'return all data from clients',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let query = {}
                    
                    if(payload.client!='0'){
                        query._id = payload.client
                    }

                    let clientsInvoices = await Client.find(query).lean()

                    for(let i=0;i<clientsInvoices.length;i++){

                        clientsInvoices[i].totalHistoric = 0
                        clientsInvoices[i].totalActual = 0
                        clientsInvoices[i].totalRetired = 0
                        clientsInvoices[i].invoiced = 0
                        clientsInvoices[i].noInvoice = 0
                        clientsInvoices[i].toInvoice = 0
                        //Lista Total
                        let containers = await Containers.find({clients: clientsInvoices[i]._id}).lean()
                        if(containers){
                            clientsInvoices[i].totalHistoric = containers.length
                            //if(containers.movements.find(x => (x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO') ? '' : '' )){
                                //clientsInvoices[i].totalRetired = containers.movements.find(x => (x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO') ? '' : '' )
                            //}
                            for(let j=0;j<containers.length;j++){
                                if(containers[j].movements.find(x => x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO')){
                                    clientsInvoices[i].totalRetired++
                                    //clientsInvoices[i].invoiced += containers[j].containers.length
                                }else{
                                    clientsInvoices[i].totalActual++

                                }
                            }
                        }
                        
                        let invoices = await Invoices.find({clients: clientsInvoices[i]._id}).lean()
                        if(invoices){
                            for(let k=0;k<invoices.length;k++){
                                if(invoices[k].type=='Factura' || invoices[k].type=='Boleta'){
                                    clientsInvoices[i].invoiced += invoices[k].containers.length
                                }else{
                                    clientsInvoices[i].noInvoice += invoices[k].containers.length
                                }
                            }
                        }

                    }
                    //Lista Por fecha
                    //Lista de Pagadas
                    
                    return clientsInvoices
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    client: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/clientInvoices',
        options: {
            description: 'get all clients data',
            notes: 'return all data from clients',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    
                    let query = {
                        date: {
                            $gt: `${payload.startDate}T00:00:00.000Z`,
                            $lt: `${payload.endDate}T23:59:59.999Z`
                        }
                    }
                    
                    if(payload.client!='0'){
                        query.clients= payload.client
                    }
                   
                    let clientInvoices = await Invoices.find(query).populate(['containers.containers']).lean()
                    
                    return clientInvoices
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
                    startDate: Joi.string().optional().allow(''),
                    endDate: Joi.string().optional().allow('')
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/invoiceSave',
        options: {
            description: 'create invoice',
            notes: 'create invoice',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    if(!payload.id){

                        let invoice = new Invoices({
                            type: payload.type,
                            clients: payload.clients,
                            rut: payload.rut,
                            name: payload.name,
                            number: payload.number,
                            date: payload.date,
                            paymentType: payload.paymentType,
                            paymentDate: payload.paymentDate,
                            paymentNet: payload.paymentNet,
                            paymentIVA: payload.paymentIVA,
                            paymentTotal: payload.paymentTotal,
                            containers: payload.containers
                        })

                        const response = await invoice.save()

                        return response

                    }else{

                        let invoice = await Invoices.findById(payload.id)
                        invoice.type = payload.type
                        invoice.clients = payload.clients
                        invoice.rut = payload.rut
                        invoice.name = payload.name
                        invoice.number = payload.number
                        invoice.date = payload.date
                        invoice.paymentType = payload.paymentType
                        invoice.paymentDate = payload.paymentDate
                        invoice.paymentNet = payload.paymentNet
                        invoice.paymentIVA = payload.paymentIVA
                        invoice.paymentTotal = payload.paymentTotal
                        invoice.containers = payload.containers
                        
                        const response = await invoice.save()

                        return response
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
                    id: Joi.string().optional(),
                    type: Joi.string().optional().allow(''),
                    clients: Joi.string().optional().allow(''),
                    rut: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    number: Joi.string().optional().allow(''),
                    date: Joi.string().optional().allow(''),
                    paymentType: Joi.string().optional().allow(''),
                    paymentDate: Joi.string().optional().allow(''),
                    paymentNet: Joi.number().allow(0).optional(),
                    paymentIVA: Joi.number().allow(0).optional(),
                    paymentTotal: Joi.number().allow(0).optional(),
                    containers: Joi.array().items(Joi.object().keys({
                        containers: Joi.string().optional().allow('')
                    }))
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/movementsInvoiceByFilter',
        options: {
            description: 'get one movement data',
            notes: 'return all data from movement',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload
                    let query = {}
                    let status = ''

                    var ObjectId = require('mongodb').ObjectID

                    let firstquery = {
                        clients: payload.client
                    }
                    if(payload.onlyInvoice){
                        firstquery._id = new ObjectId(payload.onlyInvoice)
                    }


                    let invoices = await Invoices.find(firstquery)
                    //console.log('invoices', invoices)

                    let arrayContainers = []
                    for(let i=0; i<invoices.length; i++){
                        for(let j=0; j<invoices[i].containers.length; j++){
                            arrayContainers.push(new ObjectId(invoices[i].containers[j].containers._id))
                        }
                    }
                    //var ObjectId = require('mongodb').ObjectID
                    //let invoices = await Invoices.find({clients: new ObjectId(payload.client)})
                    
                    if(arrayContainers.length>0){
                        if(payload.onlyInvoice){
                            query._id = {
                                $in : arrayContainers
                            }
                        }else{
                            query._id = {
                                $nin : arrayContainers
                            }
                        }
                    }

                    if(!payload.onlyInventory){
                        /*query.movements = { 
                            $elemMatch : { 
                                datetime: {
                                    $gt: `${payload.startDate}T00:00:00.000Z`,
                                    $lt: `${payload.endDate}T23:59:59.999Z`
                                }
                            }
                        }*/
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

                    let containers = await Containers.find(query).populate(['clients','containertypes','movements.sites','movements.cranes','services.services'])
                    if(payload.table){
                        containers = containers.reduce((acc, el, i) => {

                            /////SERVICIOS/////
                            let containerState = 'N/A'
                            if(el.services.find(x => x.services.name == 'Almacenamiento Vac??o') || el.services.find(x => x.services.name == 'Desconsolidado')){
                                containerState = 'VAC??O'
                            }else if(el.services.find(x => x.services.name == 'Almacenamiento Full')){
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
                                datetimeIn = el.movements[0].datetime //Modificar por ??ltimo "ingreso"
                                datetimeOut = el.movements[lastMov].datetime
                            }else if(el.movements[lastMov].movement=='TRASPASO'){
                                datetimeIn = el.movements[lastMov].datetime
                                datetimeOut = el.movements[lastMov].datetime
                            }else{
                                datetimeIn = el.movements[lastMov].datetime
                                datetimeOut = '-' //Modificar por 5 d??as y/o +extras
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
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            driverName: el.movements[lastMov].driverName,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov].driverName,
                                            driverPlate: el.movements[lastMov].driverPlate,
                                            services: el.services
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
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov-1].driverName,
                                            driverPlate: el.movements[lastMov-1].driverPlate,
                                            services: el.services
                                        })
                                    }else{
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            driverName: el.movements[lastMov].driverName,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov].driverName,
                                            driverPlate: el.movements[lastMov].driverPlate,
                                            services: el.services
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
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov].driverName,
                                            driverPlate: el.movements[lastMov].driverPlate,
                                            services: el.services
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
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov-1].driverName,
                                            driverPlate: el.movements[lastMov-1].driverPlate,
                                            services: el.services
                                        })

                                    }else if(el.movements[lastMov].movement=='TRASPASO'){
                                        acc.push({
                                            id: el._id.toString(),
                                            datetime: datetimeIn,
                                            datetimeOut: datetimeOut,
                                            movementID: lastMov,
                                            movement: el.movements[lastMov].movement,
                                            client: el.clients.name,
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov].driverName,
                                            driverPlate: el.movements[lastMov].driverPlate,
                                            services: el.services
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
                                            containerNumber: el.containerNumber,
                                            containerType: el.containertypes.name,
                                            containerLarge: el.containerLarge,
                                            containerState: containerState,
                                            site: site,
                                            position: position,
                                            driverName: el.movements[lastMov].driverName,
                                            driverPlate: el.movements[lastMov].driverPlate,
                                            services: el.services
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
                    onlyInventory: Joi.boolean().required(),
                    onlyInvoice: Joi.string().optional()
                })
            }
        }
    },  
    {
        method: 'POST',
        path: '/api/clientServices',
        options: {
            description: 'get all services taken by client',
            notes: 'return all data from services taken by client',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let payload = request.payload

                    let fullData = {
                        storageFull: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        storageEmpty: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        storageIMO: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        deconsolidated: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        transfer: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        portage: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        transport: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        },
                        total: {
                            quantity: 0,
                            net: 0,
                            iva: 0,
                            total: 0,
                            invoiced: 0,
                            inventory: 0,
                            retired: 0
                        }
                    }

                    
                    let containers = await Containers.find({clients: payload.client}).populate(['services.services']).lean()
                    let invoices = await Invoices.find({clients: payload.client}).lean()

                    /*SERVICIOS
                    - Almacenamiento Full
                    - Almacenamiento Vac??o
                    - Almacenamiento IMO
                    - Desconsolidado 20
                    - Desconsolidado 40
                    - Traspaso
                    - Porteo
                    - Transporte
                    */

                    for(let i=0;i<containers.length;i++){
                        
                        for(let j=0;j<containers[i].services.length;j++){
                            let actualService

                            switch(containers[i].services[j].services.name) {
                                case 'Almacenamiento Full':
                                    actualService = fullData.storageFull
                                break;
                                case 'D??a(s) Extra':
                                    actualService = fullData.storageFull
                                break;
                                case 'Almacenamiento Vac??o':
                                    actualService = fullData.storageEmpty
                                break;
                                case 'Almacenamiento IMO':
                                    actualService = fullData.storageIMO
                                break;
                                case 'Desconsolidado 20':
                                    actualService = fullData.deconsolidated
                                break;
                                case 'Desconsolidado 40':
                                    actualService = fullData.deconsolidated
                                break;
                                case 'Traspaso':
                                    actualService = fullData.transfer
                                break;
                                case 'Porteo':
                                    actualService = fullData.portage
                                break;
                                case 'Transporte':
                                    actualService = fullData.transport
                                break;
                            }

                            if(containers[i].services[j].services.name!='D??a(s) Extra'){
                                actualService.quantity++
                                fullData.total.quantity++
                                
                                if(containers[i].movements.find(x => x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO')){
                                    actualService.retired++
                                    fullData.total.retired++
                                }else{
                                    actualService.inventory++
                                    fullData.total.inventory++
                                }


                                ///FACTURADOS///
                                for(let k=0;k<invoices.length;k++){
                                    if(invoices[k].containers.find(x => x.containers.toString() === containers[i]._id.toString())){
                                        actualService.invoiced++
                                        fullData.total.invoiced++
                                        k = invoices.length
                                    }
                                }
                            }
                            actualService.net += containers[i].services[j].paymentNet
                            actualService.iva += containers[i].services[j].paymentIVA
                            actualService.total += containers[i].services[j].paymentTotal

                            fullData.total.net += containers[i].services[j].paymentNet
                            fullData.total.iva += containers[i].services[j].paymentIVA
                            fullData.total.total += containers[i].services[j].paymentTotal


                        }
                        

                        //clientsInvoices[i].totalHistoric = containers.length
                        //if(containers.movements.find(x => (x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO') ? '' : '' )){
                            //clientsInvoices[i].totalRetired = containers.movements.find(x => (x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO') ? '' : '' )
                        //}


                        /*if(containers[j].movements.find(x => x.movement === 'SALIDA' || x.movement === 'POR SALIR' || x.movement === 'TRASPASO')){
                            //
                        }else{
                            fullData..totalActual++
                        }*/
                        
                        /*let invoices = await Invoices.find({clients: clientsInvoices[i]._id}).lean()
                        if(invoices){
                            for(let k=0;k<invoices.length;k++){
                                if(invoices[k].type=='Factura' || invoices[k].type=='Boleta'){
                                    clientsInvoices[i].invoiced += invoices[k].containers.length
                                }else{
                                    clientsInvoices[i].noInvoice += invoices[k].containers.length
                                }
                            }
                        }*/

                    }
           
                    
                    return fullData
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
                    startDate: Joi.string().optional().allow(''),
                    endDate: Joi.string().optional().allow('')
                })
            }
        }
    }
]