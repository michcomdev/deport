import mongoose from 'mongoose'

const Schema = mongoose.Schema

const serviceSchema = new Schema({
    name: { type: String },
    net: { type: Number },
    days: { type: Number }
}, {
    versionKey: false
})

const Services = mongoose.model('services', serviceSchema)

export default Services