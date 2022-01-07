import mongoose from 'mongoose'

const Schema = mongoose.Schema

const movementSchema = new Schema({
    movement: { type: String },
    datetime: { type: Date },
    clients: { type: Schema.Types.ObjectId, ref: 'clients' },
    code: { type: String },
    containerInitials: { type: String },
    containerNumber: { type: String },
    containertypes: { type: Schema.Types.ObjectId, ref: 'containertypes' },
    containerTexture: { type: String },
    containerLarge: { type: String },
    cranes: { type: Schema.Types.ObjectId, ref: 'cranes' },
    sites: { type: Schema.Types.ObjectId, ref: 'sites' },
    position: {
        row: { type: String},
        position: { type: Number},
        level: { type: Number}
    },
    driverRUT: { type: String },
    driverName: { type: String },
    driverPlate: { type: String },
    services: { type: Schema.Types.ObjectId, ref: 'services' },
    paymentAdvance: { type: Boolean },
    paymentNet: { type: Number },
    paymentIVA: { type: Number },
    paymentTotal: { type: Number },
    observation: { type: String },
    createdAt: { type: Date, default: Date.now()}
}, {
    versionKey: false
})

const Movement = mongoose.model('movements', movementSchema)

export default Movement