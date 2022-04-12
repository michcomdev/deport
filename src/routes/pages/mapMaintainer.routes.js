export default {
    method: ['GET'],
    path: '/mapMaintainer',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            if (credentials.scope === 'admin' || credentials.scope === 'contab') {
                return h.view('mapMantainer', { credentials })
            } else {
                return h.redirect('movements')
            }
        }
    }
}
