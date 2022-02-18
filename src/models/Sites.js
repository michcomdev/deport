import mongoose from 'mongoose'

const Schema = mongoose.Schema

const sitesSchema = new Schema({
    name: { type: String },
    meterX: { type: Number},
    meterY: { type: Number},
    footX: { type: Number},
    footY: { type: Number}

}, {
    versionKey: false
})

const Sites = mongoose.model('sites', sitesSchema)

export default Sites