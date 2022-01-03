import mongoose from 'mongoose'
import dotEnv from 'dotenv'

dotEnv.config()

let access
if (process.env.STATUS == 'prod') {
    access = process.env.DB_URI
} else if (process.env.STATUS == 'dev') {
    access = process.env.DB_URI
}

try {
    mongoose.connect(access, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })

} catch (error) {
    console.log(error)
}


export default mongoose