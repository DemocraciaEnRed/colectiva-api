const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const LinksSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true }
})

// Define `Timeline` Schema
const Timeline = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  title: { type: String, required: true },
  text: { type: String },
  date: { type: Date, required: true },
  youtubeId: { type: String },
  imageUrl: { type: String },
  links: [LinksSchema]
})

// Model's Plugin Extensions
Timeline.plugin(mongoosePaginate)

// Expose Model
module.exports = mongoose.model('Timeline', Timeline)
