const axios = require('axios')
const { NOTIFIER_URL } = require('../config')
const log = require('./logger')

const http = axios.create()

exports.sendCommentNotification = (notificationType, commentId) => {
  let payload = {
    type: notificationType,
    comment: commentId
  }
  http.post(`${NOTIFIER_URL}/send-email`, payload).then((response) => {
    log.info(response.data.message, payload)
  }).catch((error) => {
    log.error('ERROR Sending Email', {
      meta: payload,
      message: error.message,
      data: error.response.data
    })
  })
}

exports.sendNewCommentNotification = (notificationType, commentId) => {
  let payload = {
    type: notificationType,
    comment: commentId
  }
  http.post(`${NOTIFIER_URL}/comment-new`, payload).then((response) => {
    log.info(response.data.message, payload)
  }).catch((error) => {
    log.error('ERROR Sending Email', {
      meta: payload,
      message: error.message,
      data: error.response.data
    })
  })
}

exports.setDocumentClosesNotification = (documentId, closingDate) => {
  let payload = {
    id: documentId,
    closingDate
  }
  http.post(`${NOTIFIER_URL}/set-document-closes`, payload).then((response) => {
    log.info(response.data.message, payload)
  }).catch((error) => {
    log.error('ERROR Setting document closes event', {
      error: error.message,
      meta: payload,
      data: error.response && error.response.data
    })
  })
}

exports.sendDocumentPublishedNotification = (documentId) => {
  let payload = {
    documentId
  }
  http.post(`${NOTIFIER_URL}/document-published`, payload).then((response) => {
    log.info(response && response.data && response.data.message, payload)
  }).catch((error) => {
    log.error('ERROR Sending Email', {
      meta: payload,
      message: error.message,
      data: error.response && error.response.data
    })
  })
}


exports.sendValidarApoyoNotification = (documentId, tokenId) => {
  let payload = {
    documentId,
    tokenId
  }
  http.post(`${NOTIFIER_URL}/apoyo-validacion`, payload).then((response) => {
    log.info(response && response.data && response.data.message, payload)
  }).catch((error) => {
    log.error('ERROR Sending Email', {
      meta: payload,
      message: error.message,
      data: error.response && error.response.data
    })
  })
}
