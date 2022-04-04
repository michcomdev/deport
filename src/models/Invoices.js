import mongoose from 'mongoose'

const Schema = mongoose.Schema

const invoicesSchema = new Schema({
    type: { type: String },
    clients: { type: Schema.Types.ObjectId, ref: 'clients' },
    rut: { type: String },
    name: { type: String },
    number: { type: String },
    date: { type: Date, default: Date.now()},
    paymentType: { type: String },
    paymentDate: { type: Date, default: Date.now()},
    paymentNet: { type: Number },
    paymentIVA: { type: Number },
    paymentTotal: { type: Number },
    containers: [{
        containers: { type: Schema.Types.ObjectId, ref: 'containers' }
    }]
}, {
    versionKey: false
})

const Invoices = mongoose.model('invoices', invoicesSchema)

export default Invoices