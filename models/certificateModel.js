const mongoose = require('mongoose');

// Define a schema for the certificate data
const certificateSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  grade: { type: String, required: true },
  startdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
  date: { type: Date, default: Date.now } // Assuming this is the date of certificate creation
});

// Create a model from the schema
const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;