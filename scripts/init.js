const mongoose = require('mongoose')
const Community = require('../models/community')
const dbCommunity = require('../db-api/community')
const CustomForm = require('../models/customForm')
const User = require('../models/user')
const DocumentTag = require('../models/documentTag')
const DocumentVersion = require('../models/documentVersion')
const dbCustomForm = require('../db-api/customForm')
const config = require('../config')
const log = require('../services/logger')

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

let userProfileCustomForm = {
  'fields': {
    'required': [],
    'richText': [],
    'allowComments': [],
    'blocks': [
      {
        'fields': [
          'party',
          'occupation',
          'birthday',
          'gender',
          'province'
        ],
        'name': 'About the user'
      }
    ],
    'properties': {
      'occupation': {
        'type': 'string',
        'title': "User's occupation"
      },
      'party': {
        'type': 'string',
        'title': "User's party"
      },
      'gender': {
        'type': 'string',
        'title': "User's gender"
      },
      'birthday': {
        'type': 'string',
        'title': "User's birthday"
      },
      'province': {
        'type': 'string',
        'title': "User's province"
      },
      'tags': {
        'title': "User's tags",
        'type': 'array',
        'uniqueItems': true,
        'items': { 'type': 'string' }
      },
      'tagsNotification': {
        'title': "User's tags notification setting",
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'boolean'
          }
        ]
      }
    }
  },
  'name': 'User Profile',
  'slug': 'user-profile',
  'icon': 'fas fa-user',
  'description': 'Template for a user profile'
}

let projectCustomForm = {
  'fields': {
    'required': [
      'fundation',
      'articles',
      'title'
    ],
    'richText': [
      'fundation',
      'articles'
    ],
    'allowComments': [
      'fundation',
      'articles'
    ],
    'blocks': [
      {
        'fields': [
          'title',
          'imgCover',
          'youtubeId',
          'customVideoId',
          'fundation'
        ],
        'name': "Project's basic info"
      },
      {
        'fields': [
          'articles'
        ],
        'name': 'Articles of the project'
      }
    ],
    'properties': {
      'title': {
        'type': 'string',
        'title': "Project's title"
      },
      'imageCover': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': 'URL for the cover of the image'
      },
      'fundation': {
        'type': 'object',
        'title': "Project's fundations"
      },
      'articles': {
        'type': 'object',
        'title': 'Articles'
      },
      'youtubeId': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'String'
          }
        ],
        'title': 'Youtube Video ID'
      },
      'customVideoId': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'String'
          }
        ],
        'title': 'HCDN Custom Video ID'
      },
      'closingDate': {
        'oneOf': [
          {
            'type': 'null'
          },
          {
            'type': 'string',
            'format': 'date-time'
          }
        ],
        'title': 'Closing date (to participate)'
      },
      'closure': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'object'
          }
        ],
        'title': 'Closure of the document'
      },
      'tags': {
        'title': "Project's tags",
        'type': 'array',
        'uniqueItems': true,
        'items': { 'type': 'string' }
      },
      'sendTagsNotification': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'boolean'
          }
        ],
        'title': "Project's tags notification settings"
      }
    }
  },
  'name': 'Project',
  'slug': 'project-form',
  'icon': 'far fa-files',
  'description': 'This is the template of fields for projects',
  'version': 0
}

const categorias = [
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

class DatabaseNotEmpty extends Error { }
class StopSetup extends Error { }

async function checkDB () {
  log.debug('* Checking if there are users without tagsNotification setting')
  let users = await User.find({ 'fields.tagsNotification': null })
  if (users && users.length) {
    log.debug(`*- Found ${users.length} users. Updating all.`)
    await User.updateMany({ fields: null }, { $set: { fields: { tagsNotification: true } } })
    await User.updateMany({ 'fields.tagsNotification': null }, { $set: { 'fields.tagsNotification': true } })
    log.debug('--> OK updating users')
  } else {
    log.debug('*- No users found. Continuing.')
  }

  log.debug('* December 2020 - Adding -key- field to tags if not there.')
  log.debug('  *  First check if there are tags...')
  const countDocumentTag = await DocumentTag.countDocuments({})
  if (countDocumentTag > 0) {
    log.debug(`  *  Found ${countDocumentTag} tags, lets check if there are tags without -key- field`)
    const countDocumentTagWithoutKeyField = await DocumentTag.countDocuments({ 'key': { $exists: false } })
    log.debug(`  *  Found ${countDocumentTagWithoutKeyField} without key field..`)
    if (countDocumentTagWithoutKeyField > 0) {
      log.debug(`  *  Starting to populate`)
      for (let index = 0; index < categorias.length; index++) {
        log.debug(`  *  Updating ${categorias[index].name} with key ${categorias[index].key}`)
        await DocumentTag.update({ 'name': categorias[index].name }, { $set: { 'key': categorias[index].key } })
      }
      log.debug(`  *  DONE`)
    } else {
      log.debug(`  *  No need to populate`)
    }
    /**
     * 2021-06-10
     * 
     * Este pedido fue porque habian usado tag ambiental para representar el Foro Legislativo Ambiental
     * El problema surge que ahora quieren el tag de vuelta. Por lo tanto tenemos que:
     * 1. Ver si ya existe el tag de foro-legislativo-ambiental
     *    - Si existe, entonces este script ya se corrio. Saltear...
     * 2. Si no se corrio, crear el tag de foro-legislativo-ambiental
     * 3. Luego buscar aquellos documentVersions que tienen en sus content.tags el tag de ambiente.
     *    - Si esta en la primera posicion, entonces tenemos que intercambiarlo con el de foro-legislativo-ambiental.
     *    - Si no esta en la primera posicion, saltear la actualizacion, no hace falta.
     * Done.
     */
    log.debug('  *  2021-06-10 Checking if foro-ambiental is created...')
    const documentTagForoAmbientalCount = await DocumentTag.countDocuments({ 'key': 'foro-legislativo-ambiental' })
    // console.log('documentTagForoAmbientalCount', documentTagForoAmbientalCount)
    if (documentTagForoAmbientalCount === 0) {
      log.debug(`    *  Create foro-legislativo-ambiental tag`)
      const foroLegislativoTag = await (await DocumentTag.create({ name: 'Foro Legislativo Ambiental', key: 'foro-legislativo-ambiental' })).toJSON()
      log.debug(`    *  So there was no foro-legislativo-ambiental, so as far as we know, all topics with tag ambiental, we need to swap it with this`)
      log.debug(`    *  we will swap topics with documentTag ambiental to the new documentTag`)
      const ambienteTag = await (await DocumentTag.findOne({ key: 'ambiente' })).toJSON()
      // console.log(ambienteTag)
      const topicsWithTagAmbiental = await DocumentVersion.find({ 'content.tags': { $exists: true, $in: [ambienteTag._id.toString()] } })
      log.debug(`    *  found ${topicsWithTagAmbiental.length} documents with this tag...`)
      // console.log(topicsWithTagAmbiental)
      log.debug(`    *  Start update loop`)
      for (const topic of topicsWithTagAmbiental) {
        if (topic.content.tags[0] === ambienteTag._id.toString()) {
          log.debug('      *  JACKPOT! Main tag is key=ambiente, swaping ambiente with foro-legislativo-ambiental')
          // console.log(foroLegislativoTag._id.toString())
          // console.log(topic)
          topic.content.tags[0] = foroLegislativoTag._id.toString()
          topic.markModified('content')
          await topic.save()
          log.debug('      *  Saved. Updated. Continue to the next topic.')
        } else {
          log.debug('      *  Topic has tag ambiente but is not the main one. Continue...')
        }
      }
      log.debug('    *  Loop finished. Done with update for 2021-07-10')
    } else {
      log.debug(`    *  Already a documentTag foro-legislativo-ambiental... no need to add it => no need to organize anything... Continuing.`)
    }
  } else {
    log.debug('  *  No tags at all.. is this first init? Then.. thats fine. Continuing')
  }
  /**
   * Finish script para 2021-06-10
   */
  log.debug('* Checking if database has data on it')
  let community = await Community.findOne({})
  let customForm = await CustomForm.findOne({})
  if (customForm) {
    log.debug('* There is at least one document type already on the DB.')
    await updateCustomForm()
  }
  if (community || customForm) throw new DatabaseNotEmpty('Skipping new setup because there is data already in the DB')
  log.debug('--> OK checking DB')
}

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

async function updateCustomForm () {
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
