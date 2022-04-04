export default {
    method: ['GET'],
    path: '/clientsReport',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('clientsReport', { credentials })
        }
    }
}