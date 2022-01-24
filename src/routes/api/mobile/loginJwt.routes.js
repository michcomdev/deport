import Joi      from 'joi'
import jwt      from 'jsonwebtoken'
import dotEnv   from 'dotenv'
import moment   from 'moment'
import User     from '../../../models/User'
import { validatePassword } from '../../../utils/passwordHandler'

dotEnv.config()

export default [{
    method: 'POST',
    path: '/api/mobile/login',
    options: {
        auth: false,
        description: 'login device with jwt',
        notes: 'Create a persistent jwt for user device',
        tags: ['api'],
        handler: async (request, h) => {
            try {
                const payload = request.payload

                let query = {
                    // password: hashPassword(payload.password),
                    $or: [
                        {
                            scope: 'user'
                        },
                        {
                            scope: 'admin'
                        }
                    ],
                    status: 'enabled'
                }

                if (payload.email) {
                    query.email = payload.email
                } else if (payload.rut) {
                    query.rut = payload.rut
                } else {
                    return h.response({
                        error: 'Incorrect User or Password'
                    }).code(404)
                }

                let findUser = await User.find(query)

                if (findUser[0]) {
                    if (validatePassword(findUser[0].password, payload.password)) {
                        let token = await jwt.sign(
                            {
                                iss: findUser[0]._id,
                                aud: 'mobileuser',
                                iat: moment().unix(),
                                id: findUser[0]._id,
                                rut: findUser[0].rut || '',
                                email: findUser[0].email,
                                name: findUser[0].name,
                                scope: findUser[0].scope,
                                // charge: findUser[0].charge,
                                termsAccepted: findUser[0].termsAccepted
                            },
                            process.env.SECRET_KEY,
                            {
                                algorithm: 'HS512'
                            }
                        )

                        await request.redis.client.hset('deportmobile', findUser[0]._id, token)

                        //findUser[0].password = undefined

                        /*
                        createMobileLog({
                            credentials: findUser[0],
                            form: 'Login mobile',
                            description: `El usuario ${findUser[0].name}, rut ${findUser[0].rut} ha iniciado sesión en el dispositivo '${payload.uuid}'`,
                            device: payload.uuid
                        })
                        */

                        //console.log(deviceToken)


                        return h.response(token).code(200)
                    }
                }

                return h.response({
                    error: 'Incorrect User or Password'
                }).code(400)

            } catch (error) {
                console.log(error)
                throw error
            }
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().max(30).optional().description('user rut'),
                email: Joi.string().email().optional().description('user email'),
                password: Joi.string().required().description('user password')
                // uuid: Joi.string().required().description('uuid from device')
            })
        }
    }
}]
