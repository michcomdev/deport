import Sites from '../../models/Sites'
import Maps from '../../models/Maps'
import Containers from '../../models/Containers'
import Joi from 'joi'
import dotEnv from 'dotenv'

dotEnv.config()

export default [
    {
        method: 'GET',
        path: '/api/sites',
        options: {
            description: 'get all sites data',
            notes: 'return all data from sites',
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
        method: 'POST',
        path: '/api/siteSingle',
        options: {
            description: 'get one site',
            notes: 'get one site',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    let sites = await Sites.findById(payload.id).lean()

                    let rows = await Maps.find({sites: payload.id}).lean().sort({'row': 'ascending'})


                    //Ubicaciones utilizadas
                    let sort = {
                        'movements.position.row': 'ascending',
                        'movements.position.position': 'ascending',
                        'movements.position.level': 'ascending'
                    }
                    //console.log('rows', rows)

                    //let positions = siteMap.find(x => x.row === $(this).val()).positions


                    let containers = await Containers.find({'movements.sites': payload.id}).populate(['clients','containertypes']).sort(sort)
                    containers = containers.reduce((acc, el, i) => {
                        let lastMov = el.movements.length - 1
                        if(el.movements[lastMov].movement!='SALIDA' && el.movements[lastMov].movement!='TRASPASO'){
                            
                            if(rows.find(x => x.row === el.movements[lastMov].position.row)){
                                let array = rows.find(x => x.row === el.movements[lastMov].position.row).positions
                                let obj = array.find(x => x.position === el.movements[lastMov].position.position)

                                if(!obj.levelOnUse){
                                    obj.levelOnUse = [el.movements[lastMov].position.level]
                                }else{
                                    if(!obj.levelOnUse.includes(el.movements[lastMov].position.level)){
                                        obj.levelOnUse.push(el.movements[lastMov].position.level)
                                    }
                                }

                            }
                        }

                        return acc
                    }, [])

                    sites.rows = rows

                    return sites

                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    id: Joi.string()
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/siteUpdate',
        options: {
            description: 'modify site',
            notes: 'modify site',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   
                    
                    let site = await Sites.findById(payload.id)

                    site.name = payload.name,
                    site.meterX = payload.meterX,
                    site.meterY = payload.meterY,
                    site.footX = payload.footX,
                    site.footY = payload.footY

                    const response = await site.save()

                    //Eliminaci??n de registros antiguos
                    await Maps.deleteMany({sites: payload.id})

                    /*Almacenamiento ubicaciones*/
                    for(let i=0;i<payload.maps.length;i++){

                        let positions = []
                        for(let j=0;j<payload.maps[i].containers;j++){
                            positions.push({
                                position: j+1,
                                levels: [1,2,3,4,5]
                            })
                        }

                        let map = new Maps({
                            sites: payload.id,
                            row: payload.maps[i].name,
                            orientation: payload.maps[i].orientation,
                            orientationNumber: payload.maps[i].orientationNumber,
                            positionX: payload.maps[i].positionX,
                            positionY: payload.maps[i].positionY,
                            positionZ: payload.maps[i].positionZ,
                            rotationY: payload.maps[i].rotationY,
                            positions: positions,
                            map2D: {
                                containers: payload.maps[i].containers,
                                x: payload.maps[i].x, //Valores en p??xeles
                                y: payload.maps[i].y,
                                width: payload.maps[i].width,
                                height: payload.maps[i].height
                            }
                        })

                        await map.save()
                    }

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
                    id: Joi.string().optional().allow(''),
                    name: Joi.string().optional().allow(''),
                    meterX: Joi.number().allow(0).allow(''),
                    meterY: Joi.number().allow(0).allow(''),
                    footX: Joi.number().allow(0).allow(''),
                    footY: Joi.number().allow(0).allow(''),
                    maps: Joi.array().items(Joi.object().keys({
                        name: Joi.string().optional().allow(''),
                        containers: Joi.number().allow(0).allow(''),
                        orientation: Joi.string().optional().allow(''),
                        orientationNumber: Joi.string().optional().allow(''),
                        positionX: Joi.number().allow(0).allow(''),
                        positionY: Joi.number().allow(0).allow(''),
                        positionZ: Joi.number().allow(0).allow(''),
                        rotationY: Joi.number().allow(0).allow(''),
                        x: Joi.number().allow(0).allow(''),
                        y: Joi.number().allow(0).allow(''),
                        width: Joi.number().allow(0).allow(''),
                        height: Joi.number().allow(0).allow('')
                    }))
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/api/siteSave',
        options: {
            description: 'create site',
            notes: 'create site',
            tags: ['api'],
            handler: async (request, h) => {
                try {

                    let payload = request.payload   

                    let site = new Sites({
                        name: payload.name,
                        meterX: payload.meterX,
                        meterY: payload.meterY,
                        footX: payload.footX,
                        footY: payload.footY
                    })

                    const response = await site.save()
                    console.log(response)

                    /*Almacenamiento ubicaciones*/
                    for(let i=0;i<payload.maps.length;i++){

                        let positions = []
                        for(let j=0;j<payload.maps[i].containers;j++){
                            positions.push({
                                position: j+1,
                                levels: [1,2,3,4,5]
                            })
                        }

                        let map = new Maps({
                            sites: response._id,
                            row: payload.maps[i].name,
                            orientation: payload.maps[i].orientation,
                            orientationNumber: payload.maps[i].orientationNumber,
                            positionX: payload.maps[i].positionX,
                            positionY: payload.maps[i].positionY,
                            positionZ: payload.maps[i].positionZ,
                            rotationY: payload.maps[i].rotationY,
                            positions: positions,
                            map2D: {
                                containers: payload.maps[i].containers,
                                x: payload.maps[i].x, //Valores en p??xeles
                                y: payload.maps[i].y,
                                width: payload.maps[i].width,
                                height: payload.maps[i].height
                            }
                        })

                        await map.save()
                    }


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
                    name: Joi.string().optional().allow(''),
                    meterX: Joi.number().allow(0).allow(''),
                    meterY: Joi.number().allow(0).allow(''),
                    footX: Joi.number().allow(0).allow(''),
                    footY: Joi.number().allow(0).allow(''),
                    maps: Joi.array().items(Joi.object().keys({
                        name: Joi.string().optional().allow(''),
                        containers: Joi.number().allow(0).allow(''),
                        orientation: Joi.string().optional().allow(''),
                        orientationNumber: Joi.string().optional().allow(''),
                        positionX: Joi.number().allow(0).allow(''),
                        positionY: Joi.number().allow(0).allow(''),
                        positionZ: Joi.number().allow(0).allow(''),
                        rotationY: Joi.number().allow(0).allow(''),
                        x: Joi.number().allow(0).allow(''),
                        y: Joi.number().allow(0).allow(''),
                        width: Joi.number().allow(0).allow(''),
                        height: Joi.number().allow(0).allow('')
                    }))
                })
            }
        }
    },
]