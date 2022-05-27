import mongoose from 'mongoose'

const Schema = mongoose.Schema

const containerSchema = new Schema({

    clients: { type: Schema.Types.ObjectId, ref: 'clients' },
    containerNumber: { type: String },
    containertypes: { type: Schema.Types.ObjectId, ref: 'containertypes' },
    containerTexture: { type: String },
    containerLarge: { type: String },
    numberIn: { type: Number },
    numberOut: { type: Number },
    numberDecon: { type: Number },
    transferIn: { type: Number },
    transferOut: { type: Number },
    movements: [{
        users: { type: Schema.Types.ObjectId, ref: 'users' },
        createdAt: { type: Date, default: Date.now()},
        movement: { type: String },
        datetime: { type: Date },
        cranes: { type: Schema.Types.ObjectId, ref: 'cranes' },
        sites: { type: Schema.Types.ObjectId, ref: 'sites' },
        position: {
            row: { type: String},
            position: { type: Number},
            level: { type: Number}
        },
        driverForeigner: { type: Boolean, default: false },
        driverRUT: { type: String },
        driverName: { type: String },
        driverPlate: { type: String },
        driverGuide: { type: String },
        driverSeal: { type: String },
        driverOutForeigner: { type: Boolean, default: false },
        driverOutRUT: { type: String },
        driverOutName: { type: String },
        driverOutPlate: { type: String },
        driverOutGuide: { type: String },
        paymentAdvance: { type: Boolean },
        paymentNet: { type: Number },
        paymentIVA: { type: Number },
        paymentTotal: { type: Number },
        observation: { type: String }
    }],
    services: [{
        serviceNumber: { type: Number },
        services: { type: Schema.Types.ObjectId, ref: 'services' },
        date: { type: Date },
        paymentType: { type: String },
        paymentNumber: { type: String },
        paymentAdvance: { type: Boolean },
        paymentNet: { type: Number },
        paymentIVA: { type: Number },
        paymentTotal: { type: Number },
        extraDays: { type: Number }
    }],
    payments: [{
        date: { type: Date },
        paymentType: { type: String },
        paymentNumber: { type: String },
        paymentAmount: { type: Number }
    }],
    paymentCredit: { type: Boolean, default: false }
})

const Containers = mongoose.model('containers', containerSchema)

export default Containers