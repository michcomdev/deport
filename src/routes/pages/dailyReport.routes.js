export default {
    method: ['GET'],
    path: '/dailyReport',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            credentials[credentials.scope] = true

            return h.view('dailyReport', { credentials })
        }
    }
}