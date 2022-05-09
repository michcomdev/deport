export default {
    method: ['GET'],
    path: '/services',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            //if (credentials.scope === 'admin' && credentials.permissions.superadmin) {
            if (credentials.scope === 'admin' || credentials.scope === 'contab') {
                return h.view('services', { credentials })
            }else{
                return h.redirect('movements')
            }
        }
    }
}