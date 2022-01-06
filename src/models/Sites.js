import mongoose from 'mongoose'

const Schema = mongoose.Schema

const sitesSchema = new Schema({
    name: { type: String }
}, {
    versionKey: false
})

const Sites = mongoose.model('sites', sitesSchema)

export default Sites