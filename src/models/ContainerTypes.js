import mongoose from 'mongoose'

const Schema = mongoose.Schema

const containerTypeSchema = new Schema({
    name: { type: String },
    type: { type: Number },
    texture: { type: String }
}, {
    versionKey: false
})

const ContainerTypes = mongoose.model('containertypes', containerTypeSchema)

export default ContainerTypes