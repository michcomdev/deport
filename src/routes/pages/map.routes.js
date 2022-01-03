export default {
    method: ['GET'],
    path: '/map',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('map', { credentials })
        }
    }
}