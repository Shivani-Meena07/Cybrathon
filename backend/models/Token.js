const mongoose = require('mongoose');


const TokenSchema = new mongoose.Schema({
serviceId: mongoose.Schema.Types.ObjectId,
studentId: mongoose.Schema.Types.ObjectId,
number: Number,
status: { type: String, default: 'waiting' }
});


module.exports = mongoose.model('Token', TokenSchema);