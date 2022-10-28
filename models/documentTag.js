const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

// Define `DocumentTag` Schema
const DocumentTag = new mongoose.Schema({
  name: { type: String },
  key: { type: String }
})

// Model's Plugin Extensions
DocumentTag.plugin(mongoosePaginate)

// Expose Model
module.exports = mongoose.model('DocumentTag', DocumentTag)
