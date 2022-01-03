import mongoose from 'mongoose'

const Schema = mongoose.Schema

const movementSchema = new Schema({
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
})

const Movement = mongoose.model('Movements', movementSchema)

export default Movement