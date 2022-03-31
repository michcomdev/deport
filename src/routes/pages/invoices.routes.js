export default {
    method: ['GET'],
    path: '/invoices',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('invoices', { credentials })
        }
    }
}