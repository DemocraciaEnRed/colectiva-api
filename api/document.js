const status = require('http-status')
const express = require('express')
const { Types: { ObjectId } } = require('mongoose')
const Document = require('../db-api/document')
const DocumentVersion = require('../db-api/documentVersion')
const Community = require('../db-api/community')
const Comment = require('../db-api/comment')
const CustomForm = require('../db-api/customForm')
const Like = require('../db-api/like')
const ApoyoToken = require('../db-api/apoyoToken')
const User = require('../db-api/user')
const router = express.Router()
const auth = require('../services/auth')
const errors = require('../services/errors')
const notifier = require('../services/notifier')
const middlewares = require('../services/middlewares')
const utils = require('../services/utils')
const json2xls = require('json2xls')
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');
const log = require('../services/logger')
const { v4: uuidv4 } = require('uuid');

/**
 * @apiDefine admin User access only
 * User must be an admin (Keycloak)
 */

/**
 * @apiDefine accountable Accountable members only
 * User must be a member of the Accountable group (Keycloak)
 */

/**
 * @apiDefine authenticated Must be authenticated
 * User must be authenticated before accessing (Keycloak)
 */

router.route('/')
  /**
   * @api {get} /documents List
   * @apiName getDocuments
   * @apiDescription Returns a paginated list of -published- documents => querystring = page,limit,closed(null,false,true),created(ASC,DESC)
   * @apiGroup Document
   */
  .get(
    async (req, res, next) => {
      try {
        let results = null
        let sort = null
        if (req.query) {
          sort = {}
          sort.createdAt = req.query.created === 'ASC' ? 1 : -1
        }
        let paginate = {
          limit: req.query.limit || 10,
          page: req.query.page || 1
        }
        results = await Document.retrieve({ published: true }, sort)
        let today = new Date()
        results.forEach((doc) => {
          doc.closed = today > new Date(doc.currentVersion.content.closingDate)
          doc.apoyosCount = doc.apoyos && doc.apoyos.length || 0
          delete doc.apoyos
        })
        if (req.query.closed !== 'null') {
          results = results.filter((doc) => {
            return doc.closed === (req.query.closed === 'true')
          })
        } else {
          let arrOpened = results.filter((doc) => {
            return doc.closed === false
          })
          let arrClosed = results.filter((doc) => {
            return doc.closed === true
          })
          results = arrOpened.concat(arrClosed)
          // results = results.sort(function (x, y) {
          //   // return (x === y)? 0 : x? -1 : 1;
          //   return (x.closed === y.closed) ? 0 : x.closed ? 1 : -1
          // })
        }
        if (req.query.tag && req.query.tag !== 'null') {
          const queryTagId = req.query.tag
          // validamos datos de la query, que sea un id de mongo
          if (/^[a-f0-9]{24}$/.test(queryTagId))
            results = results.filter(doc =>
              doc.currentVersion.content.tags ?
                doc.currentVersion.content.tags.includes(queryTagId)
              :
                false
            )
        }
        let auxOne = parseInt(results.length / paginate.limit)
        let auxTwo = results.length % paginate.limit
        if (auxTwo) {
          auxOne++
        }
        let cantTotal = results.length
        let finalArr = results.splice(((paginate.page - 1) * paginate.limit), paginate.limit)
        res.status(status.OK).json({
          results: finalArr,
          pagination: {
            count: cantTotal,
            page: paginate.page,
            pages: auxOne,
            limit: paginate.limit
          }
        })
      } catch (err) {
        next(err)
      }
    })
  /**
   * @api {post} /documents Create
   * @apiName postDocument
   * @apiDescription Creates a document and returns the created document. The author is not required to be sent on the body. API sets the author by itself.
   * @apiGroup Document
   * @apiPermission accountable
   */
  .post(
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        // ~~~~~~~~~~~~~~~~~~~~~
        // DELETED - THIS WAS DELETED IN DERLA-38
        // Get the community, we will need it to check the permissions of an accountable
        // const community = await Community.get()
        // check if the user reached the creation limit
        // const documentsCount = await Document.countAuthorDocuments(req.session.user._id)
        // if (documentsCount >= community.permissions.accountable.documentCreationLimit) {
        //   throw errors.ErrNotAuthorized(`Cannot create more documents (Creation limit reached: ${community.permissions.accountable.documentCreationLimit})`)
        // }
        // ~~~~~~~~~~~~~~~~~~~~~
        req.body.author = req.session.user._id
        // In the body of the request customForm will be a slug. It will be an id later.
        const customForm = await CustomForm.get({ slug: req.body.customForm })
        if (!customForm) {
          throw errors.ErrBadRequest('customForm')
        }
        const newDocument = await Document.create(req.body, customForm)
        // Set closing notification agenda
        notifier.setDocumentClosesNotification(newDocument._id, req.body.content.closingDate)
        // Send
        res.status(status.CREATED).send(newDocument)
      } catch (err) {
        next(err)
      }
    })

router.route('/my-documents')
  /**
     * @api {get} /my-documents List
     * @apiName getDocuments
     * @apiDescription Returns a paginated list of the users documents. Lists all kind of documents, no matter the state.
     * @apiGroup Document
     */
  .get(
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        let results = null
        let sort = null
        if (req.query) {
          sort = {}
          sort.createdAt = req.query.created === 'ASC' ? 1 : -1
        }
        let paginate = {
          limit: req.query.limit || 10,
          page: req.query.page || 1
        }
        // If it is null, just show the published documents
        results = await Document.list({ author: req.session.user._id }, {
          limit: req.query.limit,
          page: req.query.page,
          sort: sort
        })
        let today = new Date()
        results.docs.forEach((doc) => {
          if (doc.currentVersion && doc.currentVersion.content)
            doc.closed = today > new Date(doc.currentVersion.content.closingDate)
          doc.apoyosCount = doc.apoyos && doc.apoyos.length || 0
          delete doc.apoyos
        })
        let auxOne = parseInt(results.docs.length / paginate.limit)
        let auxTwo = results.total % paginate.limit
        if (auxTwo) {
          auxOne++
        }
        res.status(status.OK).json({
          results: results.docs,
          pagination: {
            count: results.total,
            page: results.page,
            pages: auxOne,
            limit: results.limit
          }
        })
      } catch (err) {
        next(err)
      }
    })

router.route('/captcha-data').get(
  async (req, res, next) => {
    try {
      // https://www.npmjs.com/package/svg-captcha
      var captcha = svgCaptcha.create();

      const hash = crypto.createHash('sha256').update(captcha.text.toLowerCase()).digest('hex')

      log.info('Returning captcha data...')
      res.status(200).json({img: captcha.data, token: hash});
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
)

router.route('/:id')
  /**
   * @api {get} /documents/:id Get
   * @apiName getDocument
   * @apiDescription Returns the data of a document.
   * @apiGroup Document
   * @apiParam {String} id Documents ID.
   * @apiSuccess {String}  id Id of the document
   * @apiSuccess {String}  author  The user id of the author.
   * @apiSuccess {String}  published State of the document. If `false` is a draft and should not be public.
   * @apiSuccess {String}  customForm Id of the custom form
   * @apiSuccess {Date}  createdAt Date of creation
   * @apiSuccess {Date}  updatedAt Date of update
   * @apiSuccess {Object}  content Content of the document
   * @apiSuccess {String}  content.title Title of the document
   * @apiSuccess {String}  content.brief A brief of the document
   * @apiSuccess {Object}  content.fields The custom fields of the document, those were defined on the custom form.
   */
  .get(
    middlewares.checkId,
    async (req, res, next) => {
      try {
        const document = await Document.get({ _id: req.params.id })
        // No document?
        if (!document) throw errors.ErrNotFound('Document not found or doesn\'t exist')
        // Check if the user is the author
        const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
        const isClosed = new Date() > new Date(document.currentVersion.content.closingDate)
        // Check if it is published or not (draft)
        if (!document.published) {
          // It's a draft, check if the author is the user who requested it.
          if (!isTheAuthor) {
            // No, Then the user shouldn't be asking for this document.
            throw errors.ErrForbidden
          }
        }
        document.closed = isClosed
        let payload = {
          document: document,
          isAuthor: isTheAuthor
        }
        // If the document is closed
        if (isClosed) {
          const contributionsData = await DocumentVersion.countContributions({ document: req.params.id })
          const contextualCommentsCount = await Comment.count({ document: req.params.id, decoration: { $ne: null } })
          const contributors = await Comment.countContributors({ document: req.params.id, decoration: { $ne: null } })
          payload.contributionsCount = contributionsData.contributionsCount
          payload.contributorsCount = contributors
          payload.contextualCommentsCount = contextualCommentsCount
        }

        payload.document.userIsApoyado = req.session.user &&
          document.apoyos &&
          document.apoyos.find(apoyo => apoyo.userId && apoyo.userId.toString() == req.session.user._id) &&
          true || false
        payload.document.apoyosCount = document.apoyos && document.apoyos.length || 0
        delete payload.document.apoyos

        // Deliver the document
        res.status(status.OK).json(payload)
      } catch (err) {
        next(err)
      }
    })
  /**
   * @api {put} /documents/:id Update
   * @apiName putDocument
   * @apiDescription Modifies a document. You just need to send the changed fields. No need to send all the document.
   * @apiGroup Document
   * @apiPermission accountable
   * @apiParam {Number} id Documents ID.
   */
  .put(
    middlewares.checkId,
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        // Get the document
        const document = await Document.get({ _id: req.params.id })
        if (!document) {
          throw errors.ErrNotFound('Document not found')
        }
        // Check if the user is the author of the document
        if (!req.session.user._id.equals(document.author._id)) {
          throw errors.ErrForbidden // User is not the author
        }
        // First deal with the decorations! Comments needs to be updated!
        if (req.body.decorations && req.body.decorations.length > 0) {
          await Comment.updateDecorations(document.currentVersion._id, req.body.decorations)
        }
        let newDataDocument = {
          published: req.body.published,
          closed: req.body.closed
        }
        // Retrieve the version of the customForm that the document follows
        const customForm = await CustomForm.get({ _id: document.customForm })
        // Check if this will imply a new document version
        if (req.body.contributions && req.body.contributions.length > 0) {
          // Set the data to save
          const newVersionData = {
            document: document._id,
            version: document.currentVersion.version + 1,
            content: req.body.content,
            contributions: req.body.contributions
          }
          // Create the new version
          const versionCreated = await DocumentVersion.create(document.currentVersion._id, newVersionData, customForm)
          // Set the lastVersion recently created
          newDataDocument.currentVersion = versionCreated._id
          // Get the users that contributed
          let idsArray = req.body.contributions.map((id) => {
            return ObjectId(id)
          })
          let query = {
            _id: { $in: idsArray }
          }
          const comments = await Comment.getAll(query, true)
          // Send email
          comments.forEach((comment) => {
            notifier.sendCommentNotification('comment-contribution', comment._id)
          })
        } else {
          // Update the version document
          await DocumentVersion.update(document.currentVersion._id, req.body.content, customForm)
        }
        // Update the document, with the correct customForm
        let updatedDocument = await Document.update(req.params.id, newDataDocument)
        // Set document closes event
        if (req.body.content && req.body.content.closingDate) {
          notifier.setDocumentClosesNotification(updatedDocument.id, req.body.content.closingDate)
        }

        if (!document.publishedMailSent && updatedDocument.published && req.body.content && req.body.content.sendTagsNotification){
          console.log('MANDANDOO')
          notifier.sendDocumentPublishedNotification(updatedDocument.id)
          updatedDocument = await Document.update(updatedDocument.id, {publishedMailSent: true})
        }
        res.status(status.OK).json(updatedDocument)
      } catch (err) {
        next(err)
      }
    })

router.route('/:id/version/:version')
  .get(
    middlewares.checkId,
    async (req, res, next) => {
      try {
        // let query = {
        //   document: req.params.id,
        //   version: req.params.version
        // }
        const document = await Document.get({ _id: req.params.id })
        // No document?
        if (!document) throw errors.ErrNotFound('Document not found or doesn\'t exist')
        // Check if the user is the author
        const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
        const isClosed = new Date() > new Date(document.currentVersion.content.closingDate)
        // Check if it is published or not (draft)
        if (!document.published) {
          // It's a draft, check if the author is the user who requested it.
          if (!isTheAuthor) {
            // No, Then the user shouldn't be asking for this document.
            throw errors.ErrForbidden
          }
        }
        document.closed = isClosed
        let payload = {
          document: document,
          isAuthor: isTheAuthor
        }
        const version = await DocumentVersion.get({ document: req.params.id, version: req.params.version })
        if (!version) throw errors.ErrNotFound('Version not found or doesn\'t exist')
        payload.retrievedVersion = version
        // If the document is closed
        if (isClosed) {
          const contributionsData = await DocumentVersion.countContributions({ document: req.params.id })
          const contextualCommentsCount = await Comment.count({ document: req.params.id, decoration: { $ne: null } })
          const contributors = await Comment.countContributors({ document: req.params.id, decoration: { $ne: null } })
          payload.contributionsCount = contributionsData.contributionsCount
          payload.contributorsCount = contributors
          payload.contextualCommentsCount = contextualCommentsCount
        }
        // Deliver the document
        res.status(status.OK).json(payload)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/comments')
  /**
     * @api {get} /documents/:idDocument/comments Get an array of comments
     * @apiName getSomeComments
     * @apiGroup Comments
     * @apiDescription You can get an array of comments of a document, as long you provide the correct querystring. No querystring at all returns a BAD REQUEST error.
     * @apiParam {ObjectID(s)} [ids] A list of ObjectIds, separated by comma. Ex: <code>ids=commentI21,commentId2,commentId3</code>
     * @apiParam {String} [field] The name of the field that the comments belongs to
     */
  .get(
    middlewares.checkId,
    async (req, res, next) => {
      try {
        // If there are no query string, then throw an error
        if (!utils.checkIfAtLeastOneQuery(req.query, ['ids', 'field'])) {
          throw errors.ErrMissingQuerystring(['ids', 'field'])
        }
        // Prepare query
        let query = {
          document: req.params.id
        }
        // If there is a "ids" querystring.. add it
        if (req.query.ids) {
          const idsToArray = req.query.ids.split(',')
          let idsArray = idsToArray.map((id) => {
            return ObjectId(id)
          })
          query._id = { $in: idsArray }
        }
        // If there is a "field" querystring.. add it
        if (req.query.field) {
          query.field = req.query.field
          query.resolved = false
        }

        const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

        let comments = await Comment.getAll(query, false)
          .then(mapPromises(
            async (comment) => {
              const likes = await Like.getAll({
                comment: ObjectId(comment._id)
              })

              return { ...comment.toJSON(), likes: (likes ? likes.length : 0) }
            }
          ))

        if (req.session.user) {
          comments = await mapPromises(
            async (comment) => {
              const like = await Like.get({
                user: ObjectId(req.session.user._id),
                comment: ObjectId(comment._id)
              })

              return { ...comment, isLiked: !!like }
            }
          )(comments)
        }
        return res.status(status.OK).json(comments)
      } catch (err) {
        next(err)
      }
    }
  )
  /**
   * @api {post} /documents/:id/:field/comments Create
   * @apiName createComment
   * @apiGroup Comments
   * @apiDescription Creates a comment on a specific field of a document.
   * @apiPermission authenticated
   * @apiParam {string} field (Body) The field of the document where the comment is being made
   * @apiParam {Number} comment (Body) The field of the document where the comment is being made
   * @apiExample {json} POST body
   * {
   *  "field": "authorName",
   *  "comment": "Nullam sit amet ipsum id metus porta rutrum in vel nibh. Sed efficitur quam urna, eget imperdiet libero ornare."
   * }
   */
  .post(
    middlewares.checkId,
    auth.keycloak.protect(),
    async (req, res, next) => {
      try {
        req.body.user = req.session.user._id // Set the user
        req.body.document = req.params.id // Set the document
        const document = await Document.get({ _id: req.params.id })
        if (!document) {
          // Document not found
          throw errors.ErrNotFound('Document not found')
        }
        // Document Found
        // Get the customForm
        const customForm = await CustomForm.get({ _id: document.customForm })
        if (!customForm.fields.allowComments.find((x) => { return x === req.body.field })) {
          // If the field is not inside the "allowComments" array, throw error
          throw errors.ErrInvalidParam(`The field ${req.body.field} is not commentable`)
        }

        if (document.currentVersion.content.closingDate) {
          const closingDate = new Date(document.currentVersion.content.closingDate)
          const nowDate = new Date()
          if (closingDate < nowDate) {
            // The document is closed, no more comments allowed
            throw errors.ErrClosed
          }
        }
        // Field is commentable
        // Create the body of the new comment
        let commentBody = {
          user: req.session.user._id,
          document: document._id,
          version: document.currentVersion._id,
          field: req.body.field,
          content: req.body.content,
          decoration: req.body.decoration || null
        }
        // Save the comment
        const newComment = await Comment.create(commentBody)
        await Document.addComment({ _id: req.params.id })
        // If is NOT the author then send a notification to the author
        const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
        if (!isTheAuthor) {
          notifier.sendNewCommentNotification('comment-new', newComment._id)
        }
        // Return the comment with the ID
        res.status(status.CREATED).send(newComment)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/comments/:idComment/resolve')
  /**
       * @api {post} /documents/:idDocument/comments/:idComment/resolve Resolve a comment of a document
       * @apiName resolveComment
       * @apiGroup Comments
       * @apiDescription Resolves a comment of a document. This only sets the value <code>resolved</code> of a comment
       *
       * The only one who can do this is the author of the document.
       *
       * @apiPermission accountable
       */
  .post(
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        const { idComment } = req.params
        const document = await Document.get({ _id: req.params.id })
        // Check if the user is the author of the document
        if (!req.session.user._id.equals(document.author._id)) {
          throw errors.ErrForbidden // User is not the author
        }
        // Update the comment
        const commentResolved = await Comment.resolve({ _id: req.params.idComment })
        notifier.sendCommentNotification('comment-resolved', idComment)
        res.status(status.OK).json(commentResolved)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/comments/:idComment/like')
  /**
   * @api {post} /documents/:idDocument/comments/:idComment/like Like a comment of a document
   * @apiName likeComment
   * @apiGroup Comments
   * @apiDescription Likes a comment of a document
   * @apiPermission accountable
   *
   */
  .post(
    auth.keycloak.protect(),
    async (req, res, next) => {
      try {
        const userId = req.session.user._id
        const { idComment } = req.params

        const like = await Like.get({
          user: userId,
          comment: idComment
        })

        if (!like) {
          const document = await Document.get({ _id: req.params.id })
          const isTheAuthor = req.session.user ? req.session.user._id.equals(document.author._id) : false
          const createdLike = await Like.create({
            user: userId,
            comment: idComment
          })
          if (isTheAuthor) {
            notifier.sendCommentNotification('comment-liked', idComment)
          }
          res.json(createdLike)
        } else {
          await Like.remove(like._id)
          res.json(null)
        }
        res.status(status.OK)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/comments/:idComment')
  .delete(
    auth.keycloak.protect(),
    async (req, res, next) => {
      try {
        const { idComment } = req.params
        const document = await Document.get({ _id: req.params.id })
        const comment = await Comment.get({ _id: req.params.idComment })
        // is the author of the document? He/She can delete the comment
        const isTheAuthorOfDocument = req.session.user ? req.session.user._id.equals(document.author._id) : false
        // check if is the creator of the comment
        const isTheAuthorOfComment = req.session.user ? req.session.user._id.equals(comment.user._id) : false
        if (!isTheAuthorOfDocument && !isTheAuthorOfComment) {
          throw errors.ErrForbidden
        }
        await Comment.remove(idComment)
        await Document.subtractComment({ _id: req.params.id })
        res.json({ message: 'Comentario borrado exitosamente' })
        res.status(status.OK)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/comments/:idComment/reply')
  .post(
    middlewares.checkId,
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        const document = await Document.get({ _id: req.params.id })
        // Check if the user is the author of the document
        if (!req.session.user._id.equals(document.author._id)) {
          throw errors.ErrForbidden // User is not the author
        }
        // Update the comment
        const commentUpdated = await Comment.reply({ _id: req.params.idComment }, req.body.reply)
        notifier.sendCommentNotification('comment-replied', req.params.idComment)
        res.status(status.OK).json(commentUpdated)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/apoyar').post(
  auth.keycloak.protect(),
  middlewares.checkId,
  async (req, res, next) => {
    try {
      let documentId = req.params.id
      let userId = req.session.user._id
      await Document.apoyar(documentId, userId)
      res.status(status.OK).send()
    } catch (err) {
      next(err)
    }
  }
)
router.route('/:id/apoyar-anon').post(
  middlewares.checkId,
  async (req, res, next) => {
    try {
      const documentId = req.params.id
      const { nombre_apellido, email, captcha, token } = req.body

      // comprobamos captcha
      const captchaHash = crypto.createHash('sha256').update(captcha.toLowerCase()).digest('hex')
      if (!captcha || captchaHash != token.toLowerCase())
        return res.status(500).json({error: 'Texto de imagen incorrecto'})
      log.info('Captcha válido');

      // comprobamos si ese email no tiene un apoyo ya efectuado
      const hasApoyado = await Document.get({ _id: documentId, 'apoyos.email': email })
      if (hasApoyado)
        return res.status(500).json({error: 'Usted ya ha apoyado el proyecto'})

      // que siga abierto (nunca se debería llegar acá normalmente)
      const document = await Document.get({ _id: documentId })
      const isClosed = new Date() > new Date(document.currentVersion.content.closingDate)
      if (isClosed)
        return res.status(500).json({error: 'El proyecto ya finalizó el periodo de aportes'})

      // comprobamos si ya hay un apoyo en proceso de validación
      const existingApoyoToken = await ApoyoToken.getByEmail(email)
      if (existingApoyoToken){
        let firstDate = existingApoyoToken.createdAt,
          secondDate = new Date(),
          timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
        let instevaloMs = 1000 *60 *60 *48; //48 horas
        if (timeDifference < instevaloMs)
          return res.status(500).json({error: 'Ya se envió un mensaje de validación a este mail'})
        else
          await existingApoyoToken.remove()
      }

      // creamos token para validación de apoyo
      const uuid = uuidv4();
      const apoyo = await ApoyoToken.create({
        document: ObjectId(documentId),
        email,
        token: uuid,
        nombreApellido: nombre_apellido
      })

      // scheduleamos mail de validación
      notifier.sendValidarApoyoNotification(documentId, apoyo._id)

      res.status(status.OK).send()

    } catch (err) {
      next(err)
    }
  }
)

router.route('/apoyo-anon-validar/:uuid').get(
    async (req, res, next) => {
      try {
        const uuid = req.params.uuid

        const apoyo = await ApoyoToken.getByUuid(uuid).populate('document')

        if (!apoyo)
          return res.status(500).json({error: 'Apoyo inexistente'})

        // efectuamos apoyo
        await Document.apoyarAnon(apoyo)

        // borramos apoyoToken
        apoyo.remove()

        // traemos data actualizada
        const document = await Document.get({ _id: apoyo.document._id })

        // borramos apoyos con mails de gente!
        delete document.apoyos

        res.status(status.OK).json({document})
      } catch (err) {
        next(err)
      }
    }
  )

router.use(json2xls.middleware)


function escapeTxt (text) {
  if (!text) return ''

  return text
    .toString()
    .replace(/"/g, '\'')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
    .trim()
}

function formatXlsDate (date){
  if (!date) return ''

  let isoStr = date.toISOString() // '2020-08-28T15:30:07.185Z'
  let mainParts = isoStr.split('T') // [ 2020-08-28 , 15:30:07.185Z ]
  let timeParts = mainParts[1].split('.') // [ 15:30:07 , 185Z ]

  return `${mainParts[0]} ${timeParts[0]}`.trim() // '2020-08-28 15:30:07'
}
router.route('/my-documents/export-xls')
  /**
     * @api {get} /my-documents/export-xls Excel
     * @apiName getDocumentsExcel
     * @apiGroup Document
     */
  .get(
    auth.keycloak.protect('realm:accountable'),
    async (req, res, next) => {
      try {
        const today = new Date()
        const exportRows = []

        const documents = await Document.retrieve({ author: req.session.user._id }, { createdAt: -1})
        console.log(`Exporting ${documents.length} documents to xls`)

        // Using async/await with a forEach loop - https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
        await Promise.all(documents.map(async (doc) => {
          const currentContent = doc.currentVersion.content
          const contributions = doc.currentVersion.contributions
          const docClosed = today > new Date(currentContent.closingDate)

          const documentData = {
            'Fecha creación': formatXlsDate(doc.createdAt),
            'Título': escapeTxt(currentContent.title),
            'Publicado': doc.published ? 'Sí' : 'No',
            'Cerrado': docClosed ? 'Sí' : 'No',
            'Comentarios totales': doc.commentsCount
          }

          let comments = await Comment.getAll({ document: doc._id }, true)

          let commentData = {
            'Usuario Nombre': '',
            'Usuario Email': '',
            'Fecha Comentario': '',
            'Comentario': '',
            'Respuesta': '',
            'Fecha Aporte': '',
            'Aporte': '',
            'Resuelto': '',
          }

          if (!comments || !comments.length)
            exportRows.push(Object.assign({}, documentData, commentData))
          else
            comments.forEach(com => {
              let isContribution = com.field == 'articles'

              Object.assign(commentData, {
                'Usuario Nombre': escapeTxt(com.user.fullname),
                'Usuario Email': com.user.email || 'Sin email',
              })

              if (isContribution){
                Object.assign(commentData, {
                  'Fecha Aporte': formatXlsDate(com.createdAt),
                  'Aporte': escapeTxt(com.content),
                  'Resuelto': com.resolved ? 'Sí' : 'No',
                })
              }else{
                Object.assign(commentData, {
                  'Fecha Comentario': formatXlsDate(com.createdAt),
                  'Comentario': escapeTxt(com.content),
                  'Respuesta': escapeTxt(com.reply),
                })
              }

              exportRows.push(Object.assign({}, documentData, commentData))

            })//end comments.forEach
          //end if
        }))//end await Promise.all

        console.log(`Sending xls with ${exportRows.length} rows`)
        res.xls('', exportRows);
      } catch (err) {
        next(err)
      }
    })


router.route('/my-documents/export-apoyos-xls').get(
  auth.keycloak.protect('realm:accountable'),
  async (req, res, next) => {
    try {
      const today = new Date()
      const exportRows = []

      const documents = await Document.retrieve({ author: req.session.user._id }, { createdAt: -1})
      console.log(`Exporting ${documents.length} documents apoyos to xls`)

      // Using async/await with a forEach loop - https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
      await Promise.all(documents.map(async (doc) => {
        const currentContent = doc.currentVersion.content
        const contributions = doc.currentVersion.contributions
        const docClosed = today > new Date(currentContent.closingDate)
        const apoyosCount = doc.apoyos && doc.apoyos.length | 0
        let apoyosMails = []

        if (doc.apoyos)
          for (const apoyo of doc.apoyos) {
            let mail = 'sin mail'
            if (apoyo.email)
              mail = apoyo.email
            else if (apoyo.userId) {
              const user = await User.get({_id: apoyo.userId}, true)
              if (user && user.email)
                mail = user.email
            }
            apoyosMails.push(mail)
          }

        const documentData = {
          'Fecha creación': formatXlsDate(doc.createdAt),
          'Título': escapeTxt(currentContent.title),
          'Publicado': doc.published ? 'Sí' : 'No',
          'Cerrado': docClosed ? 'Sí' : 'No',
          'Apoyos totales': apoyosCount,
          'Apoyos mails': escapeTxt(apoyosMails.join(','))
        }

        exportRows.push(documentData)
      }))//end await Promise.all

      console.log(`Sending xls with ${exportRows.length} rows`)
      res.xls('', exportRows);
    } catch (err) {
      next(err)
    }
  }
)


module.exports = router
