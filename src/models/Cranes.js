import mongoose from 'mongoose'

const Schema = mongoose.Schema

const cranesSchema = new Schema({
    name: { type: String }
}, {
    versionKey: false
})

const Cranes = mongoose.model('cranes', cranesSchema)

export default Cranes