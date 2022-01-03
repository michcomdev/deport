export default {
    method: ['GET', 'POST'],
    path: '/logout',
    options: {
        handler: async (request, h) => {
            request.cookieAuth.clear()
            return h.redirect('/login')
        }
    }
}