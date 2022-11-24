const status = require('http-status')
const express = require('express')
const { Types: { ObjectId } } = require('mongoose')
const Timeline = require('../db-api/timeline')
const Document = require('../db-api/document')
const auth = require('../services/auth')
const errors = require('../services/errors')

const router = express.Router()

router.route('/:documentId')
  .get(async (req, res, next) => {
    try {
      console.log('========================')
      console.log('========================')
      console.log('========================')
      console.log('========================')
      const { documentId } = req.params
      // retrieve all timelines for a document
      const timelines = await Timeline.getAll({ document: ObjectId(documentId) })
      res.status(status.OK).json(timelines)
    } catch (err) {
      next(err)
    }
  })
  .post(
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        const { documentId } = req.params
        // const document = await Document.get({ _id: req.params.id })
        // check if it is an mongo id or a slug
        const document = await Document.get({ _id: documentId })
        // No document?
        if (!document) throw errors.ErrNotFound('Document not found or doesn\'t exist')
        // Check if the user is the author
        const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
        // Check if it is the author
        if (!isTheAuthor) {
          // No, Then the user shouldn't be asking for this document.
          throw errors.ErrForbidden
        }
        const event = req.body
        // create a new timeline+
        const newEvent = {
          document: ObjectId(documentId),
          ...event
        }
        console.log('========================')
        console.log(newEvent)
        const timeline = await Timeline.create(newEvent)
        res.status(status.CREATED).json(timeline)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:documentId/:timelineId')
  .delete(async (req, res, next) => {
    try {
      const { documentId, timelineId } = req.params
      // const document = await Document.get({ _id: req.params.id })
      // check if it is an mongo id or a slug
      const document = await Document.get({ _id: documentId })
      // No document?
      if (!document) throw errors.ErrNotFound('Document not found or doesn\'t exist')
      // Check if the user is the author
      const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
      // Check if it is the author
      if (!isTheAuthor) {
        // No, Then the user shouldn't be asking for this document.
        throw errors.ErrForbidden
      }
      // delete a timeline
      await Timeline.delete({ document: ObjectId(documentId), _id: ObjectId(timelineId) })
      res.status(status.OK).json({})
    } catch (err) {
      next(err)
    }
  })

module.exports = router
