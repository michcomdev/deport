import User from '../../models/User'
import { clean } from 'rut.js'
import { validatePassword } from '../../utils/passwordHandler'

export default {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
        auth: {
            mode: 'try'
        },
        plugins: {
            '@hapi/cookie': {
                redirectTo: false
            }
        }
    },
    handler: async (request, h) => {
        try {
            if (request.auth.isAuthenticated) return h.redirect('/')

            let account = null

            if (request.method === 'post') {
                let payload = request.payload || { rut: null, password: null }

                if (!payload.rut || !payload.password) {
                    return h.view('login',
                        {
                            message: 'Debe ingresar su rut y contraseña'
                        },
                        { layout: 'no-logged-layout' }
                    )
                }

                let cleanRut = clean(payload.rut).toUpperCase()

                let findUser = await User.findOne({
                    rut: cleanRut,
                    status: 'enabled'
                }).lean()

                if (findUser) {
                    if (validatePassword(findUser.password, payload.password)) {
                        account = findUser
                    }
                }

                if (!account) {
                    return h.view('login',
                        {
                            message: 'Usuario o contraseña incorrectos'
                        },
                        {
                            layout: 'no-logged-layout'
                        }
                    )
                }

                const sid = account._id.toString()

                delete account.password

                await request.server.app.cache.set(sid, { account }, 0)

                request.cookieAuth.set({ sid })

                return h.redirect('/')
            }

            return h.view('login', {}, { layout: 'no-logged-layout' })
        } catch (error) {
            console.log(error)

            return h.view('login',
                {
                    message: 'Ha ocurrido un error. Por favor recarga la página e inténtelo nuevamente.'
                },
                {
                    layout: 'no-logged-layout'
                }
            )
        }
    }
}