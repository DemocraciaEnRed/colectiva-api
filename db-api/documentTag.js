const DocumentTag = require('../models/documentTag')
const { ErrNotFound } = require('../services/errors')

exports.get = function get (query) {
  return DocumentTag.findOne(query)
}

exports.getAll = function getAll (query) {
  return DocumentTag.find(query)
}

exports.loadIfNotExists = function loadIfNotExists (query) {
  const count = DocumentTag.count({})

  if (count > 0) {
    throw new Exception(`There are already ${count} document tags loaded in the database.`)
  }

  const categorías = [
    { name: 'Construcción de paz y seguridad', key: 'paz-seguridad' },
    { name: 'Derechos sexuales y reproductivos', key: 'derecho-sexual' },
    { name: 'Participación política', key: 'participacion-politica' },
    { name: 'Violencias basadas en género', key: 'violencia-genero' },
    { name: 'Reducción de brechas de desigualdad', key: 'reduccion-desigualdad' },
    { name: 'Atención a crisis climática', key: 'crisis-climatica' }
  ]

  return DocumentTag.deleteMany({}).then(() => {
    return DocumentTag.insertMany(categorías.map((c) => { return { name: c.name, key: c.key } }))
  }).then(() => {
    console.log('DocumentTags loaded')
    return this.getAll()
  }).catch((error) => {
    console.log('DocumentTags load error')
    console.log(error)
  })
}

/* exports.create = function create (data) {
  return (new DocumentTag(data)).save()
}

exports.remove = function remove (id) {
  return DocumentTag.findById(id)
    .then((like) => {
      if (!like) throw ErrNotFound('DocumentTag to remove not found')
      return like.remove()
    })
} */
