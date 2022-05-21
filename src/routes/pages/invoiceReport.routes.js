export default {
    method: ['GET'],
    path: '/invoiceReport',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('invoiceReport', { credentials })
        }
    }
}