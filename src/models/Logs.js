import mongoose from 'mongoose'

const Schema = mongoose.Schema

const logsSchema = new Schema({
    users: { type: Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now()},
    type: { type: String, required: true },
    data: Schema.Types.Mixed
}, {
    versionKey: false
})

const Logs = mongoose.model('logs', logsSchema)

export default Logs