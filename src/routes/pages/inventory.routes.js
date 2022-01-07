export default {
    method: ['GET'],
    path: '/inventory',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('inventory', { credentials })
        }
    }
}