import mongoose from 'mongoose'

const Schema = mongoose.Schema

const clientSchema = new Schema({
    name: { type: String },
    email: { type: String },
    status: { type: String, required: true },
    debt: { type: String },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const Client = mongoose.model('Clients', clientSchema)

export default Client