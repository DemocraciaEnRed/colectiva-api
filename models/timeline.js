const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')


// Define `Timeline` Schema
const Timeline = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  title: { type: String, required: true },
  text: { type: String },
  date: { type: Date, required: true },
  youtubeId: { type: String },
  imageUrl: { type: String }
})

// Model's Plugin Extensions
Timeline.plugin(mongoosePaginate)

// Expose Model
module.exports = mongoose.model('Timeline', Timeline)
