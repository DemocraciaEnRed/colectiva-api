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
    { name: 'Ambiente', key: 'ambiente' },
    { name: 'Ciencia y tecnología', key: 'ciencia-tecnologia' },
    { name: 'Economía y finanzas', key: 'economia' },
    { name: 'Comercio', key: 'comercio' },
    { name: 'Cultura', key: 'cultura' },
    { name: 'Deporte', key: 'deporte' },
    { name: 'Derechos Humanos', key: 'derechos-humanos' },
    { name: 'Discapacidad', key: 'discapacidad' },
    { name: 'Educación', key: 'educacion' },
    { name: 'Federalización', key: 'federalizacion' },
    { name: 'Género y diversidad', key: 'genero-diversidad' },
    { name: 'Homenajes y reconocimientos', key: 'homenajes' },
    { name: 'Impuestos y servicios', key: 'impuestos' },
    { name: 'Industria', key: 'industria' },
    { name: 'Internacional', key: 'internacional' },
    { name: 'Justicia', key: 'justicia' },
    { name: 'Legislación Penal', key: 'legislacion' },
    { name: 'Libertad de expresión', key: 'libertad' },
    { name: 'Mercosur', key: 'mercosur' },
    { name: 'Modernización y transparencia', key: 'modernizacion-transparencia' },
    { name: 'Obras públicas', key: 'obras-publicas' },
    { name: 'Previsión social', key: 'prevision-social' },
    { name: 'Salud', key: 'salud' },
    { name: 'Seguridad', key: 'seguridad' },
    { name: 'Trabajo', key: 'trabajo' },
    { name: 'Transporte', key: 'transporte' },
    { name: 'Turismo', key: 'turismo' },
    { name: 'Agricultura, ganadería, minería y pesca (o actividades primarias)', key: 'agricultura' },
    { name: 'Foro Legislativo Ambiental', key: 'foro-legislativo-ambiental' }
  ]

  return DocumentTag.deleteMany({}).then(() =>
    DocumentTag.insertMany(
      categorías.map((c) => { return { name: c.name, key: c.key } })
    ).then(() => {
      console.log('DocumentTags loaded')
      return this.getAll()
    }).catch((error) => {
      console.log('DocumentTags load error')
      console.log(error)
    })
  )
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
