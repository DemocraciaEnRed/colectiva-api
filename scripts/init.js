const mongoose = require('mongoose')
const Community = require('../models/community')
const dbCommunity = require('../db-api/community')
const CustomForm = require('../models/customForm')
const User = require('../models/user')
const Document = require('../models/document')
const DocumentTag = require('../models/documentTag')
const DocumentVersion = require('../models/documentVersion')
const dbCustomForm = require('../db-api/customForm')
const config = require('../config')
const log = require('../services/logger')
const userProfileCustomForm = require('./userProfileCustomForm')
const projectCustomForm = require('./projectCustomForm')

let communityData = {
  name: config.SETUP.COMMUNITY_NAME,
  mainColor: config.SETUP.COMMUNITY_COLOR,
  logo: null,
  user: null,
  userProfileSchema: null,
  initialized: true,
  permissions: {
    user: {}, // Permissions for users
    accountable: { // Permissions for accountables
      documentCreationLimit: 1
    },
    admin: {} // Permissions for admin
  }
}

class DatabaseNotEmpty extends Error { }
class StopSetup extends Error { }

async function create () {
  log.info('* Creating user profile custom form...')
  let profileSchema = await dbCustomForm.create(userProfileCustomForm)
  log.info('* Creating community...')
  communityData.userProfileSchema = profileSchema._id
  await dbCommunity.create(communityData)
  log.info('--> OK')
  log.info('* Creating document type custom form...')
  await dbCustomForm.create(projectCustomForm)
  log.info('--> OK')
  log.info('--> Setup finished!')
}

async function checkDB () {
  log.debug('* Checking if database has data on it')
  let community = await Community.findOne({})
  let documents = await Document.find({ $or: [{ private: { $exists: false } }, { allowed: { $exists: false } }] })
  if (documents.length) {
    log.warn(`2023-05-04 Found ${documents.length} Documents without "private" and "allowed" fields found. Fixing...`)
    await setUpPrivateAndAllowedFieldsDocuments()
  } else {
    log.debug('* 2023-05-04 There are no documents without "private" and "allowed" fields')
  }
  let customForm = await CustomForm.findOne({})
  if (customForm) {
    log.debug('* There is at least one customForm already on the DB.')
    log.debug('* Updating customForm for project...')
    await updateCustomForms()
  }
  if (community || customForm) {
    log.warn('Database is not empty. Setup will not run.')
    throw new DatabaseNotEmpty('Skipping new setup because there is data already in the DB')
  }
  // find all the documents without "private" and "allowed" fields
  log.debug('--> DONE: Checking DB')
}

async function setUpPrivateAndAllowedFieldsDocuments () {
  let documents = await Document.find({ $or: [{ private: { $exists: false } }, { allowed: { $exists: false } }] })
  for (let document of documents) {
    document.private = false
    document.allowed = []
    await document.save()
  }
  log.debug('--> DONE: setUpPrivateAndAllowedFieldsDocuments')
}

async function updateCustomForms () {
  log.info('* Fetching user profile form...')
  let userProfileExistingCustomForm = await CustomForm.findOne({ slug: userProfileCustomForm.slug })
  if (!userProfileExistingCustomForm) throw new StopSetup('Critical error while fetching user profile custom form')
  log.info('* Updating user profile form...')
  userProfileExistingCustomForm.fields = userProfileCustomForm.fields
  log.info('* Saving user profile form...')
  await userProfileExistingCustomForm.save()
  log.info('* Fetching user profile form...')
  let projectExistingCustomForm = await CustomForm.findOne({ slug: projectCustomForm.slug })
  if (!projectExistingCustomForm) throw new StopSetup('Critical error while fetching user profile custom form')
  log.info('* Updating project custom form...')
  projectExistingCustomForm.fields = projectCustomForm.fields
  log.info('* Saving project custom form...')
  await projectExistingCustomForm.save()
  log.debug('--> updateCustomForm OK')
}

async function startSetup () {
  try {
    await checkDB()
    await create()
  } catch (err) {
    log.warn(err.message)
  }
}

mongoose.Promise = global.Promise

exports.checkInit = async function checkInit () {
  try {
    // await checkEnv()
    log.info(`Seeding mongodb with init values`)
    mongoose
      .connect(config.MONGO_URL, { useNewUrlParser: true })
      .then(() => {
        log.info('--> OK')
        startSetup()
      })
      .catch((err) => {
        log.error(err)
        log.warn('Init stopped unexpectly')
      })
  } catch (err) {
    log.info(err.message)
    log.warn('Init stopped unexpectly')
  }
}
