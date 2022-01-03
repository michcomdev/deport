import mongoose from 'mongoose'

const Schema = mongoose.Schema

const logRecordSchema = new Schema({
    date: { type: String, required: true },
    type: { type: String, required: true },
    payload: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed
}, {
    versionKey: false
})

const LogRecord = mongoose.model('logrecords', logRecordSchema)

export default LogRecord