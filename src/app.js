import '@babel/polyfill'
import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import hapiCookie from '@hapi/cookie'
import catboxRedis from '@hapi/catbox-redis'
import hapiRouter from 'hapi-router'
import dotEnv from 'dotenv'
import moment from 'moment'
import hapiSwagger from 'hapi-swagger'
import hapiAuthJWT from 'hapi-auth-jwt2'
import hapiRedis from 'hapi-redis2'
import Pack from '../package.json'
import Handlebars from 'handlebars'
import HandlebarsExtendBlock from 'handlebars-extend-block'
import Nes from '@hapi/nes'

import './database'

dotEnv.config()

const internals = {}
const swaggerOptions = {
    info: {
        title: 'DEPORT API DOCUMENTATION',
        version: Pack.version
    }
}

internals.server = async () => {
    try {
        let server = await Hapi.server({
            host: '0.0.0.0',
            port: 2022,
            cache: {
                provider: {
                    constructor: catboxRedis,
                    options: {
                        partition: 'deportservercookies',
                        host: process.env.REDIS_HOST || '127.0.0.1',
                        port: 6379,
                        password: process.env.REDIS_PASSWORD,
                        db: 7
                    }
                }
            }
        })

        await server.register([
            Inert,
            Vision,
            hapiCookie,
            hapiAuthJWT,
            {
                plugin: hapiSwagger,
                options: swaggerOptions
            },
            {
                plugin: hapiRedis,
                options: {
                    settings: {
                        port: 6379,
                        host: process.env.REDIS_HOST || '127.0.0.1',
                        family: 4,
                        password: process.env.REDIS_PASSWORD,
                        db: 7
                    },
                    decorate: true
                }
            }
        ])

        const cache = server.cache({
            segment: 'sessions',
            expiresIn: moment.duration(24, 'hours').asMilliseconds()
        })

        server.app.cache = cache

        server.auth.strategy('session', 'cookie', {
            cookie: {
                name: 'sid-deport',
                password: process.env.SECRET_KEY,
                isSecure: false,
            },
            redirectTo: '/login',
            validateFunc: async (request, session) => {
                const cached = await cache.get(session.sid)
                const out = {
                    valid: !!cached
                }

                if (out.valid) {
                    out.credentials = cached.account
                }

                return out
            }
        })

        server.auth.strategy('jwt', 'jwt', {
            key: process.env.SECRET_KEY,          // Never Share your secret key
            validate: async function (decoded, request) {

                if (decoded.aud && decoded.aud == 'mobileuser') {
                    let tokenredis = await request.redis.client.hget('deportmobile', decoded.id)

                    if (!tokenredis) {
                        return { isValid: false }
                    } else {
                        return { isValid: true }
                    }
                }
            },            // validate function defined above
            verifyOptions: { algorithms: ['HS512'] }
        })

        await server.auth.default('session')

        await server.register([
            {
                plugin: Nes,
                options: {
                    auth: {
                        type: 'token',
                        password: process.env.SECRET_KEY
                    }
                }
            },
            {
                plugin: hapiRouter,
                options: {
                    routes: (!process.env.STATUS || process.env.STATUS === 'dev') ? 'src/routes/**/*.routes.js' : 'dist/routes/**/*.routes.js'
                }
            }
        ])

        await server.subscription('/adminAuthorizations/{type}')

        await server.views({
            engines: {
                html: {
                    module: HandlebarsExtendBlock(Handlebars),
                    isCached: false
                }
            },
            path: 'views',
            layoutPath: 'views/layout',
            layout: 'default'
        })

        // TODO ANTES DE ESTO

        await server.initialize()
        await server.start()

        console.log('Server running on %s', server.info.uri)

        process.on('unhandledRejection', (err) => {
            console.log(err)

        })
    } catch (error) {
        console.log(error)
    }
}

internals.start = async function () {
    try {
        await internals.server()
    } catch (error) {
        console.error(error.stack)
        process.exit(1)
    }
}

internals.start()