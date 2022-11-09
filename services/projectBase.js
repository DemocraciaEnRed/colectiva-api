let randomWords = [
  'therefore',
  'disease',
  'living',
  'distant',
  'task',
  'famous',
  'choice',
  'paper',
  'studied',
  'fallen',
  'addition',
  'nails',
  'composed',
  'lack',
  'younger',
  'struggle',
  'involved',
  'larger',
  'gate',
  'deep',
  'prove',
  'pain',
  'important',
  'known',
  'television',
  'pass',
  'should',
  'organization',
  'concerned',
  'shop',
  'slowly',
  'ever',
  'ring',
  'law',
  'private',
  'life',
  'inch',
  'glass',
  'clothes',
  'element',
  'foreign',
  'scientist',
  'porch',
  'where',
  'prepare',
  'rain',
  'hit',
  'duck',
  'fine',
  'refused',
  'including'
]

function createSlugFromRandomWords () {
  let slug = ''
  let randomIndex = Math.floor(Math.random() * randomWords.length)
  slug += randomWords[randomIndex]
  randomIndex = Math.floor(Math.random() * randomWords.length)
  slug += '-' + randomWords[randomIndex]
  randomIndex = Math.floor(Math.random() * randomWords.length)
  slug += '-' + randomWords[randomIndex]
  return slug
}

function getClosingDateToISO () {
  let closingDate = new Date()
  closingDate.setDate(closingDate.getDate() + 30)
  closingDate.setHours(0, 0, 0, 0)
  return closingDate.toISOString()
}

let projectBase = {
  'published': false,
  'closed': false,
  'slug': null,
  'customForm': 'project-form',
  'content': {
    'title': 'Mi nuevo proyecto',
    'imageCover': null,
    'youtubeId': 'r9hZuc72C48',
    'fundation': {
      'object': 'value',
      'document': {
        'object': 'document',
        'data': {
        },
        'nodes': [
          {
            'object': 'block',
            'type': 'paragraph',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Esta sección es un espacio para redactar un texto que sirve para presentar el proyecto, explicar el contexto (de donde surge, su importancia, etc.), e invitar la ciudadanía a participar. Es muy importante mencionar qué tipo de aportes ciudadanos se esperan. El proyecto tiene que estar explicado de manera muy simple, la redacción debe ser fácil de entender.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    'articles': {
      'object': 'value',
      'document': {
        'object': 'document',
        'data': {
        },
        'nodes': [
          {
            'object': 'block',
            'type': 'title',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Art. 1º.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          },
          {
            'object': 'block',
            'type': 'paragraph',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sed purus justo. Nam tempus ligula nec est scelerisque aliquet. Phasellus pretium rhoncus pharetra. Duis dapibus felis neque.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          },
          {
            'object': 'block',
            'type': 'title',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Art. 2°.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          },
          {
            'object': 'block',
            'type': 'paragraph',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Fusce elementum posuere dolor id mattis. Sed magna arcu, rutrum eu pellentesque nec, feugiat sit amet lorem. Fusce volutpat, dolor a pretium fermentum, felis justo rhoncus nisl, vel mollis est diam mollis nisl. Sed aliquet erat sed ipsum lacinia, feugiat interdum ante pulvinar. Integer ut consectetur velit.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          },
          {
            'object': 'block',
            'type': 'title',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'Art. 3°.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          },
          {
            'object': 'block',
            'type': 'paragraph',
            'data': {
            },
            'nodes': [
              {
                'object': 'text',
                'leaves': [
                  {
                    'object': 'leaf',
                    'text': 'In id neque posuere, dictum arcu vitae, euismod nulla. Integer eu euismod ipsum. In aliquet nisl mi, nec vulputate urna hendrerit eu. Integer in mi at quam luctus posuere. Integer magna sem, viverra non ultrices vitae, varius in mi.',
                    'marks': [
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    'closure': null,
    'closingDate': null
  }
}

function createProjectBase () {
  let project = JSON.parse(JSON.stringify(projectBase))
  project.slug = createSlugFromRandomWords()
  project.content.closingDate = getClosingDateToISO()
  return project
}

module.exports = createProjectBase
