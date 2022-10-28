const { Types: { ObjectId } } = require('mongoose')
const { merge } = require('lodash/object')
const Document = require('../models/document')
const DocumentVersion = require('../models/documentVersion')
const dbUser = require('../db-api/user')
const validator = require('../services/jsonSchemaValidator')
const errors = require('../services/errors')

exports.countAuthorDocuments = async function countAuthorDocuments (author) {
  return Document.count({ author: author })
}

exports.isAuthor = async function isAuthor (id, author) {
  let count = await Document.countDocuments({ _id: id, author: author })
  return count
}

// Create document
exports.create = async function create (documentData, customForm) {
  // Check if the data is valid
  validator.isDataValid(
    customForm.fields,
    documentData.content
  )
  // Create a new document
  let documentToSave = {
    author: documentData.author,
    customForm: customForm._id,
    published: documentData.published
  }
  // Save the document, to get the id
  let theDocument = await (new Document(documentToSave)).save()
  // Create a new version
  let versionToSave = {
    document: theDocument._id,
    version: 1,
    content: documentData.content,
    contributions: []
  }
  // Save the documentVersion
  let theVersion = await (new DocumentVersion(versionToSave)).save()
  // Refer the currentVersion of the document to the saved version.
  theDocument.currentVersion = theVersion._id
  // Save on DB
  await theDocument.save()
  theDocument.content = theVersion.content
  return theDocument
}

// Get document (with its last version)
exports.get = async function get (query) {
  let document = await Document.findOne(query).populate({ path: 'author', select: dbUser.exposeAll(false) }).populate('currentVersion').lean()
  return document
}

exports.retrieve = async function get (query, sort) {
  let theSort = sort || {}
  console.log(theSort)
  let document = await Document.find(query).populate({ path: 'author', select: dbUser.exposeAll(false) }).populate('currentVersion').sort(theSort).lean()
  return document
}

// List documents
exports.list = async function list (query, { limit, page, sort }) {
  let optionsPaginate = {}
  optionsPaginate.limit = limit
  optionsPaginate.page = page
  optionsPaginate.lean = true
  optionsPaginate.populate = [{ path: 'author', select: dbUser.exposeAll(false) }, {path: 'currentVersion'}]
  if (sort) {
    optionsPaginate.sort = sort
  }
  let documentList = await Document.paginate(query, optionsPaginate)
  // let promisesPopulate = documentList.docs.map(async (doc) => {
  //   let theVersion = await DocumentVersion.findOne({
  //     document: doc._id,
  //     version: doc.lastVersion
  //   }).lean()
  //   let aux = doc
  //   aux.content = theVersion.content
  //   return aux
  // })
  // let populatedDocs = await Promise.all(promisesPopulate)
  // documentList.docs = populatedDocs
  return documentList
}

// Update document
exports.update = async function update (id, document) {
  // First, find if the document exists
  return Document.findOne({ _id: id })
    .then((_document) => {
      // Founded?
      if (!_document) throw errors.ErrNotFound('Document to update not found')
      // Deep merge the change(s) with the document
      let documentToSave = merge(_document, document)
      // Save!
      return documentToSave.save()
    })
}

// Update document
exports.addComment = async function addComment (id) {
  // First, find if the document exists
  return Document.findOne({ _id: id })
    .then((_document) => {
      // Founded?
      if (!_document) throw errors.ErrNotFound('Document to update not found')
      // Deep merge the change(s) with the document
      _document.commentsCount = _document.commentsCount + 1
      // Save!
      return _document.save()
    })
}

// Update document
exports.subtractComment = async function subtractComment (id) {
  // First, find if the document exists
  return Document.findOne({ _id: id })
    .then((_document) => {
      // Founded?
      if (!_document) throw errors.ErrNotFound('Document to update not found')
      // Deep merge the change(s) with the document
      _document.commentsCount = _document.commentsCount - 1
      // Save!
      return _document.save()
    })
}

exports.remove = function remove (id) {
  return Document.findOne({ _id: id })
    .then((document) => {
      if (!document) throw errors.ErrNotFound('Document to remove not found')
      document.remove()
    })
}

exports.apoyar = async function apoyar (documentId, userId) {
  // primero vemos si ya apoyó
  let documentApoyado = await Document.findOne({ _id: documentId, 'apoyos.userId': userId })
  if (!documentApoyado)
    return Document.updateOne({_id: documentId}, {'$push': {apoyos: {userId: userId}}})
  else
    return documentApoyado
}

exports.apoyarAnon = async function apoyarAnon(apoyoToken) {
  // primero vemos si ya apoyó
  let documentApoyado = await Document.findOne({ _id: apoyoToken.document._id, 'apoyos.email': apoyoToken.email })
  if (!documentApoyado)
    await Document.updateOne({_id: apoyoToken.document._id}, {
      '$push': {
        apoyos: {
          email: apoyoToken.email,
          nombreApellido: apoyoToken.nombreApellido
        }
      }
    })
}
