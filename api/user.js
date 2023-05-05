const status = require('http-status')
const express = require('express')
const router = express.Router()
const User = require('../db-api/user')
const auth = require('../services/auth')
const middlewares = require('../services/middlewares')

router.route('/')
/**
 * @api {get} /users List users
 * @apiName getUsers
 * @apiGroup User
 */
  .get(
    async (req, res, next) => {
      try {
        const results = await User.list({}, {
          limit: req.query.limit,
          page: req.query.page
        }, false)
        res.status(status.OK).json({
          results: results.docs,
          pagination: {
            count: results.total,
            page: results.page,
            limit: results.limit
          }
        })
      } catch (err) {
        next(err)
      }
    })
/**
 * @api {put} /users/:id Updates users info
 * @apiName putUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users ID.
 */
  .put(
    auth.keycloak.protect(),
    async (req, res, next) => {
      try {
        const updatedUser = await User.update(req.session.user._id, req.body)
        // actualizamos el usuario de la sesión
        req.session.user = updatedUser
        res.status(status.OK).json(updatedUser)
      } catch (err) {
        next(err)
      }
    })

router.route('/me')
/**
 * @api {get} /me Get the info of the logged user
 * @apiName getMyInfo
 * @apiGroup User
 */
  .get(
    auth.keycloak.protect(),
    async (req, res, next) => {
      try {
        // console.log(req.kauth.grant)
        res.status(status.OK).json(req.session.user)
        // res.status(status.OK).json(req.kauth.grant)
      } catch (err) {
        next(err)
      }
    })

router.route('/list')
  .get(
    auth.keycloak.protect(['realm:accountable', 'realm:admin']),
    async (req, res, next) => {
      try {
        // get the query param ids that its a string of ids separated by commas
        const ids = req.query.ids.split(',')
        const results = await User.list({ _id: { $in: ids } }, { limit: req.query.limit, page: 1 }, true)
        const filteredResults = results.docs.map((user) => {
          return {
            _id: user._id,
            email: user.email,
            fullname: user.fullname,
            avatar: user.avatar,
            isAccountable: user.roles.includes('accountable')
          }
        })
        res.status(status.OK).json(filteredResults)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/search')
  .get(
    auth.keycloak.protect(['realm:accountable', 'realm:admin']),
    async (req, res, next) => {
      try {
        if (!req.query.name && !req.query.email) return res.status(status.OK).json([])
        let results = null
        if (req.query.name) {
          results = await User.list({ fullname: { $regex: req.query.name, $options: 'i' } }, { limit: req.query.limit, page: 1 }, true)
        }
        if (req.query.email) {
          results = await User.list({ email: { $regex: req.query.email, $options: 'i' } }, { limit: req.query.limit, page: 1 }, true)
        }

        if (!results) return res.status(status.OK).json([])

        const filteredResults = results.docs.map((user) => {
          return {
            _id: user._id,
            email: user.email,
            fullname: user.fullname,
            avatar: user.avatar,
            isAccountable: user.roles.includes('accountable')
          }
        })

        res.status(status.OK).json(filteredResults)
      } catch (err) {
        next(err)
      }
    }
  )

router.route('/:id/avatar')
/**
   * @api {get} /users/:id Gets a user
   * @apiName getUser
   * @apiGroup User
   *
   * @apiParam {Number} id Users ID.
   */
  .get(
    middlewares.checkId,
    async (req, res, next) => {
      try {
        // TODO
        const user = await User.get({ _id: req.params.id }, true)
        const b64 = user.avatar.split(',')[1]
        let img = Buffer.from(b64, 'base64')
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Content-Length': img.length
        })
        res.end(img)
      } catch (err) {
        next(err)
      }
    })

router.route('/:id')
/**
     * @api {get} /users/:id Gets a user
     * @apiName getUser
     * @apiGroup User
     *
     * @apiParam {Number} id Users ID.
     */
  .get(
    middlewares.checkId,
    async (req, res, next) => {
      try {
        // TODO
        const result = await User.get({ _id: req.params.id }, false)
        res.status(status.OK).json(result)
      } catch (err) {
        next(err)
      }
    })
/**
     * @api {delete} /users/:id Delets a user
     * @apiName deleteUser
     * @apiGroup User
     *
     * @apiParam {Number} id Users ID.
     */
  .delete(
    middlewares.checkId,
    auth.keycloak.protect('realm:admin'),
    async (req, res, next) => {
      try {
        // TODO
        User.remove(req.params.id)
        res.status(status.OK).json({ id: req.params.id })
      } catch (err) {
        next(err)
      }
    })

module.exports = router
