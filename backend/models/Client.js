const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    referenceNo: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    xray: { type: String, default: '' },
    communicationAudio: { type: String, default: '' },
    communicationVideo: { type: String, default: '' },
    patientEnquiryDate: { type: Date },
    patientAppointmentDate: { type: Date },
    treatmentDetails: { type: String, default: '' },
    patientLoginTime: { type: Date },
    procedureMaterial: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Client', clientSchema)
