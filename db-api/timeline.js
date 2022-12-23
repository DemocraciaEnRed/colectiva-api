const { Types: { ObjectId } } = require('mongoose')
// const { merge } = require('lodash/object')
const Timeline = require('../models/timeline')
// const validator = require('../services/jsonSchemaValidator')
const errors = require('../services/errors')
// const dbUser = require('./user')

// Create new timeline
exports.create = async function create (event) {
  return (new Timeline(event)).save()
}

// Get all the timelines from a document ordered by date
exports.getAll = async function getAll (query, expose) {
  let timelines = await Timeline.find(query).sort({ date: -1 }).lean()
  return timelines
}

// delete a timeline
exports.delete = async function deleteTimeline (query) {
  return Timeline.deleteOne(query)
}
