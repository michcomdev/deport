import dotEnv from 'dotenv' 

dotEnv.config()

export default {
    method: 'GET',
    path: '/public/{path*}',
    options: {
      cache: {
          expiresIn: 0,
          privacy: 'private'
      },
      auth: false,
      handler: {
        directory: {
          path: './public',
          listing: false,
          index: false
        }
      }
    }
}