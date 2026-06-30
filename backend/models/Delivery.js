const mongoose = require('mongoose')
const deliverySchema = new mongoose.Schema({
  salutation: { type: String, enum: ['Mr','Mrs','Ms','Dr'], default: 'Mr' },
  patientName: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  phone: { type: String, required: true },
  alternativePhone: { type: String, default: '' },
  guardianRelation: { type: String, enum: ['Father','Mother','Daughter','Son','Siblings','Spouse','Other'], default: 'Father' },
  guardianName: { type: String, default: '' },
  address: { type: String, required: true },
  pincode: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  sourceOfReference: { type: String, enum: ['Client (Patient)','Dr','Media','Walkin','Neighborhood','Family','IIT'], default: 'Walkin' },
  deliveryDate: { type: Date },
  deliveryStatus: { type: String, enum: ['Pending','Dispatched','Delivered','Failed'], default: 'Pending' },
  notes: { type: String, default: '' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
module.exports = mongoose.model('Delivery', deliverySchema)
