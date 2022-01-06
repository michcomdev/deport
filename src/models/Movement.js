import mongoose from 'mongoose'

const Schema = mongoose.Schema

/*const movementSchema = new Schema({
    cod: { type: String },
    mov: { type: String },
    container: { type: String },
    large: { type: String, required: true },
    plate: { type: String, required: true },
    driver: { type: String, required: true },
    enterprise: { type: String },
    createdAt: { type: Date, default: Date.now()},
}, {
    versionKey: false
})*/


const movementSchema = new Schema({
    movement: { type: String },
    datetime: { type: Date },
    client: { type: String },
    code: { type: String },
    containerInitials: { type: String },
    containerNumber: { type: String },
    containerType: { type: String },
    containerLarge: { type: String },
    crane: { type: String },
    site: { type: String },
    position: { type: String },
    driverRUT: { type: String },
    driverName: { type: String },
    driverPlate: { type: String },
    paymentAdvance: { type: Boolean },
    paymentValue: { type: Number },
    observation: { type: String },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const Movement = mongoose.model('Movements', movementSchema)

export default Movement