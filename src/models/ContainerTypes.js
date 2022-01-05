import mongoose from 'mongoose'

const Schema = mongoose.Schema

const containerTypeSchema = new Schema({
    name: { type: String }
}, {
    versionKey: false
})

const ContainerTypes = mongoose.model('containerTypes', containerTypeSchema)

export default ContainerTypes