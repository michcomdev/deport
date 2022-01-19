export default {
    method: ['GET'],
    path: '/report',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('report', { credentials })
        }
    }
}