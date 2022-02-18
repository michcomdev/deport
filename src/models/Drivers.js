import mongoose from 'mongoose'

const Schema = mongoose.Schema

const driversSchema = new Schema({
    rut: { type: String },
    name: { type: String },
    lastPlate: { type: String }
}, {
    versionKey: false
})

const Drivers = mongoose.model('drivers', driversSchema)

export default Drivers