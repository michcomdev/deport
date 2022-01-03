module.exports = [
    {
        method: 'GET',
        path: '/api/check',
        options: {
            auth: { mode: 'try' },
            description: 'check current user session',
            notes: 'if session doesn t exist return error',
            tags: ['api'],
            handler: (request, h) => {
                return {
                    isAuthenticated: request.auth.isAuthenticated
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/session',
        options: {
            description: 'get current user session data',
            notes: 'return session data',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    const credentials = request.auth.credentials

                    return credentials
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'No se han encontrado credenciales'
                    }).code(404)
                }
            }
        }
    }
]