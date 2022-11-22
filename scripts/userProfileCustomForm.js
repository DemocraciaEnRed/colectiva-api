let listOfDepartments = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada"
];

let userProfileCustomForm = {
  'fields': {
    'required': [],
    'richText': [],
    'allowComments': [],
    'blocks': [
      {
        'fields': [
          'birthday',
          'department'
        ],
        'name': 'About the user'
      }
    ],
    'properties': {
      'birthday': {
        'type': 'string',
        'title': "User's birthday"
      },
      'whatsapp': {
        'type': 'string',
        'title': "User's birthday"
      },
      'department': {
        'title': "User's department",
        'anyof': [
          {
            'type': 'null'
          },
          {
            'type': 'string',
            'enum': listOfDepartments
          }
        ]
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

module.exports = userProfileCustomForm