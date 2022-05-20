import mongoose from 'mongoose'

const Schema = mongoose.Schema

const clientSchema = new Schema({
    rut: { type: String },
    name: { type: String },
    nameFull: { type: String },
    email: { type: String },
    contact: { type: String },
    contactPhone: { type: String },
    credit: { type: Boolean },
    creditLimit: { type: Number },
    status: { type: String, required: true },
    debt: { type: String },
    createdAt: { type: Date, default: Date.now()},
    services: {
        storage: { type: Boolean },
        deconsolidated: { type: Boolean },
        portage: { type: Boolean },
        transport: { type: Boolean }
    },
    rates: [{
        services: { type: Schema.Types.ObjectId, ref: 'services' },
        net: { type: Number }
    }]
}, {
    versionKey: false
})

const Client = mongoose.model('clients', clientSchema)

export default Client