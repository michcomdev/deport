import Joi from 'joi'
import User from '../../models/User'
import dotEnv from 'dotenv'
//import sgMail from '@sendgrid/mail'
// import nodemailer from 'nodemailer'
// import Cryptr from 'cryptr'
import { hashPassword } from '../../utils/passwordHandler'

dotEnv.config()

// const cryptr = new Cryptr(process.env.SECRET_KEY)

//sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default [
    {
        method: 'GET',
        path: '/api/users',
        options: {
            description: 'get all users data',
            notes: 'return all data from users',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let users = await User.find().lean()
                    return users
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
        path: '/api/users',
        options: {
            description: 'save user',
            notes: 'create or modify user',
            tags: ['api'],
            handler: async (request) => {
                try {
                    let payload = request.payload
                    if (payload._id) { // modificar usuario
                        let findUser = await User.findById(payload._id)

                        findUser.name = payload.name
                        findUser.lastname = payload.lastname
                        findUser.email = payload.email
                        findUser.status = payload.status
                        findUser.scope = payload.scope
                        findUser.password = payload.password
                        // findUser.permissions = {
                        //     superadmin: payload.permissions.superadmin
                        // }

                        await findUser.save()

                        return findUser

                    } else {  // crear usuario
                        // const originalPass = payload.password
                        payload.status = 'enabled'
                        payload.permissions = {
                            superadmin: true
                        }
                        payload.password = hashPassword(payload.password)

                        let newUser = new User(payload)

                        await newUser.save()

                        // await sendEmail(payload.email, payload.name, originalPass)

                        return newUser
                    }

                } catch (error) {
                    console.log(error)

                    return {
                        error: 'Ha ocurrido un error al guardar datos de usuario'
                    }
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/usersEnabled',
        options: {
            description: 'get all users data',
            notes: 'return all data from users',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let users = await User.find({
                        status: 'enabled'
                    }).lean()
                    return users
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
        path: '/api/usersfdsf',
        options: {
            description: 'create user',
            notes: 'create user (seller or admin)',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    // let payload = request.payload



                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            },
            validate: {
                payload: Joi.object().keys({
                    _id: Joi.string(),
                    cod: Joi.string(),
                    name: Joi.string().required().min(1).lowercase().trim(),
                    email: Joi.string().required().email().lowercase().trim(),
                    emailPassword: Joi.string().optional(),
                    store: Joi.string(),
                    status: Joi.string().required().valid('enabled', 'disabled'),
                    scope: Joi.string().required().valid('seller', 'admin', 'assistant'),
                    permissions: Joi.object().optional().keys({
                        superadmin: Joi.boolean().required(),
                        commercial: Joi.boolean().required(),
                        collections: Joi.boolean().required()
                    }),
                    sellers: Joi.array().optional().items(Joi.object().keys({
                        codVendedor: Joi.string().required(),
                        nombreVendedor: Joi.string().required()
                    }))
                })
            }
        }
    },
]

// const sendEmail = async (userEmail, userName, userPassword) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: 'smtp.office365.com',
//             port: 587,
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: process.env.EMAIL_SENDER,
//                 pass: process.env.EMAIL_SENDER_PASSWORD
//             },
//             tls: {
//                 // do not fail on invalid certs
//                 //rejectUnauthorized: false,
//                 ciphers: 'SSLv3'
//             }
//         })

//         let emailData = {
//             from: process.env.EMAIL_SENDER,
//             to: [userEmail],
//             subject: 'Tu cuenta DEPORT',
//             html: `
//                 <h2>Bienvenido a DEPORT <strong>${userName.toUpperCase()}</strong>!</h2>

//                 <p>Recuerda que puedes ingresar al sistema utilizando tu rut y contraseña</p>
//                 <br>
//                 <p>Tu contraseña: <strong>${userPassword}</strong></p>
//             `
//         }

//         let info = await transporter.sendMail(emailData)

//         return info

//     } catch (error) {
//         console.log(error)
//         return false
//     }
// }