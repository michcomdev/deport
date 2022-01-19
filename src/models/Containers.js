import mongoose from 'mongoose'

const Schema = mongoose.Schema

const containerSchema = new Schema({

    clients: { type: Schema.Types.ObjectId, ref: 'clients' },
    containerInitials: { type: String },
    containerNumber: { type: String },
    containertypes: { type: Schema.Types.ObjectId, ref: 'containertypes' },
    containerTexture: { type: String },
    containerLarge: { type: String },
    movements: [{
        createdAt: { type: Date, default: Date.now()},
        movement: { type: String },
        datetime: { type: Date },
        code: { type: String },
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
        paymentAdvance: { type: Boolean },
        paymentNet: { type: Number },
        paymentIVA: { type: Number },
        paymentTotal: { type: Number },
        observation: { type: String }
    }],
    services: [{
        services: { type: Schema.Types.ObjectId, ref: 'services' },
        paymentAdvance: { type: Boolean },
        paymentNet: { type: Number },
        paymentIVA: { type: Number },
        paymentTotal: { type: Number }
    }]
})

const Containers = mongoose.model('containers', containerSchema)

export default Containers