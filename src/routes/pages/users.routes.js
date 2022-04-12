export default {
    method: ['GET'],
    path: '/users',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            //if (credentials.scope === 'admin' && credentials.permissions.superadmin) {
            if (credentials.scope === 'admin') {
                return h.view('users', { credentials })
            } else {
                return h.redirect('movements')
            }
        }
    }
}