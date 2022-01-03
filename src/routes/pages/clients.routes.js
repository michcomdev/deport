export default {
    method: ['GET'],
    path: '/clients',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            if (credentials.scope === 'admin' && credentials.permissions.superadmin) {
                return h.view('clients', { credentials })
            }
        }
    }
}