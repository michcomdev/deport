export default {
    method: ['GET'],
    path: '/report',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true


            if (credentials.scope === 'admin' || credentials.scope === 'contab') {
                return h.view('report', { credentials })
            } else {
                return h.redirect('movements')
            }
            
        }
    }
}