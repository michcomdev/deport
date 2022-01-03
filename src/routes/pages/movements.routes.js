export default {
    method: ['GET'],
    path: '/movements',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('movements', { credentials })
        }
    }
}