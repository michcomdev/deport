import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
    rut:  {type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    scope: { type: String, required: true },
    status: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now()},
    permissions: {
        superadmin: { type: Boolean, default: false }, // superadmin
    }
}, {
    versionKey: false
})

const User = mongoose.model('Users', userSchema)

export default User