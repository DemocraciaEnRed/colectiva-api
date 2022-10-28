const ApoyoToken = require('../models/apoyoToken')
const { ErrNotFound } = require('../services/errors')

exports.getByEmail = function get (email) {
  return ApoyoToken.findOne({email})
}

exports.getByUuid = function get (uuid) {
  return ApoyoToken.findOne({token: uuid})
}

exports.getAll = function get (query) {
  return ApoyoToken.find(query)
}

exports.create = function create (apoyoTokenData) {
  return (new ApoyoToken(apoyoTokenData)).save()
}

exports.remove = function remove (id) {
  return ApoyoToken.findById(id)
    .then((apoyoToken) => {
      if (!apoyoToken) throw ErrNotFound('ApoyoToken to remove not found')
      return apoyoToken.remove()
    })
}
