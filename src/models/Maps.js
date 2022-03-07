import mongoose from 'mongoose'

const Schema = mongoose.Schema

const mapSchema = new Schema({
    sites: { type: Schema.Types.ObjectId, ref: 'containertypes' },
    row: { type: String },
    orientation: { type: String },
    orientationNumber: { type: String },
    positionX: { type: Number},
    positionY: { type: Number},
    positionZ: { type: Number},
    rotationY: { type: Number},
    positions: { type: Array },
    map2D: {
        containers: { type: Number},
        x: { type: Number},
        y: { type: Number},
        width: { type: Number},
        height: { type: Number}
    }
}, {
    versionKey: false
})

const Maps = mongoose.model('maps', mapSchema)

export default Maps