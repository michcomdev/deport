import mongoose from 'mongoose'

const Schema = mongoose.Schema

const parametersSchema = new Schema({
    numberIn: { type: Number },
    numberOut: { type: Number },
    numberDecon: { type: Number},
    transferIn: { type: Number },
    transferOut: { type: Number },
    waitingTime: {
        min: { type: Number },
        medium: { type: Number },
        max: { type: Number }
    }
}, {
    versionKey: false
})

const Parameters = mongoose.model('parameters', parametersSchema)

export default Parameters