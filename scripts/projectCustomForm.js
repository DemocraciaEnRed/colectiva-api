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
          'authorFullname',
          'authorRole',
          'authorAvatar',
          'authorBio',
          'status',
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
      'authorFullname': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': "Project's author fullname"
      },
      'authorRole': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': "Project's author role"
      },
      'authorAvatar': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': 'URL for the avatar of the author',
        'format': 'uri'
      },
      'authorBio': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': "Project's author bio"
      },
      'status': {
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string'
          }
        ],
        'title': "Project's status"
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

module.exports = projectCustomForm