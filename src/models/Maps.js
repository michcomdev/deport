import mongoose from 'mongoose'

const Schema = mongoose.Schema

const mapSchema = new Schema({
    sites: { type: Schema.Types.ObjectId, ref: 'containertypes' },
    row: { type: String },
    positions: { type: Array }
}, {
    versionKey: false
})

const Maps = mongoose.model('maps', mapSchema)

export default Maps