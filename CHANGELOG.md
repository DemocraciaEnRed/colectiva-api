# Changelog

### 1.9.4

2021-06-10: Este pedido fue porque habian usado tag ambiental para representar el Foro Legislativo Ambiental

El problema surge que ahora se requiere el tag de vuelta. Por lo tanto tenemos que:

1. Ver si ya existe el tag de foro-legislativo-ambiental
   - Si existe, entonces este script ya se corrio. Saltear...
2. Si no se corrio, crear el tag de foro-legislativo-ambiental
3. Luego buscar aquellos documentVersions que tienen en sus content.tags el tag de ambiente.
   - Si esta en la primera posicion, entonces tenemos que intercambiarlo con el de foro-legislativo-ambiental.
   - Si no esta en la primera posicion, saltear la actualizacion, no hace falta.
4. Done.

Compatible con:
* `leyesabiertas-web:1.9.4`
* `leyesabiertas-core:1.9.4`
* `leyesabiertas-notifier:1.9.1`
* `leyesabiertas-keycloak:1.8.0`


### 1.9.2

Aumentado a las settings del server limites para el payload ya que habia reporte de algunos articulos que no estaban pudiendo ser guardados por limites en el payload.

Mas info en: https://reactgo.com/request-entity-too-large-node/

```
server.use(express.json({limit: '50mb'}))
server.use(express.urlencoded({ limit: '50mb', extended: false }))
```

Compatible con:
* `leyesabiertas-web:1.9.3`
* `leyesabiertas-core:1.9.2`
* `leyesabiertas-notifier:1.9.1`
* `leyesabiertas-keycloak:1.8.0`

### 1.9.0

1. Nueva funcion: Apoyar un proyecto. Ahora se puede apoyar un proyecto, como usuario registrado o como anonimo (con la necesidad de ingresar la informacion, un captcha, y una validacion por email)
2. Se agrega la posibilida de que en el perfil del diputada/o se pueda descargar la planilla con un listado de la informacion de quienes apoyaron los proyectos
3. Cambios visuales: Ahora los header de las cards de los proyectos tendrán una imagen de -LA PRIMERA- etiqueta/categoria elegida en el formulario del proyecto. En el caso de que no existiera, se pondrá una imagen estandar

Listado de cambios:

- Agregado campo "apoyos" en Documents como array de strings (emails)
- Agregado campo "apoyosCount" en las apis que devuelven Documents (para mostrar en tarjetas de home y dentro del proyecto)
- Se implementó un método de captcha para apoyos externos
- Se desarrollo un circuito de validación de apoyo externo (usuarix no registradx) por email usando tabla de tokens
- Al apoyar, se valida que ese mail no haya apoyado ya una vez
- Al apoyar, se valida que ese mail no tenga un token de validación vigente (creado en las últimas 48hs)
- Verificacion del captcha! (svg-captcha https://www.npmjs.com/package/svg-captcha)
- Usuarix no registradxs: Al poner mail y nombre se le avisa a lx usuarix de que va a recibir un mail para validar
- Se genera token de un solo uso (que "caduque" a las 48hs) para validar voto
- Se crea la tabla apoyoTokens con campos: token, fecha creación, email
- El token se generará como uuid v4 (https://www.npmjs.com/package/uuid)
- En el script init borraran los token más viejos que de 48hs
- Enviar mail (desde notifier) con link con el token en la url para validar el voto
- Cuando alguien X entré a validar el token, se verifica que este en el rango de 48hs (sino se avisa que ya expiró), y si lo está se registra un apoyo a nombre del mail del token y se borra el token
- Para apoyos internos (usuarix registradx) simplemente registrar el apoyo y ya
- Se agrega la posibilidad de descargar un excel con todos los apoyos registrados en los proyectos.
- Se quito el campo de URL de la imagen, dado que no va a ser mas utlilzado
- Ahora las etiquetas cuentan con una "key", importante para coordinar con que imagen mostrar en el header de la card del proyecto
- Ahora para monitores mas grandes-largos (2K/4K) se muestran 4 columnas de cards de proyectos en la home

Compatible con:
* `leyesabiertas-web:1.9.0`
* `leyesabiertas-core:1.9.0`
* `leyesabiertas-notifier:1.9.0`
* `leyesabiertas-keycloak:1.8.0`

**1.8.1**


- Se quito async/await de las llamadas al notifier desde la api, para que
- Fix: Ahora los proyectos sin comentarios tambien aparecen en el excel de proyectos
- Por defecto los usuarios recibbirian notificaciones en su correo electronico
- Los usuarios con la opcion de "recibir notificaciones" en undefined (viejos) ahora por defecto se les asigna a true.

Compatible con:
* `leyesabiertas-web:1.8.1`
* `leyesabiertas-notifier:1.8.0`
* `leyesabiertas-keycloak:1.8.0`

**1.8.0**

Listado de cambios hasta el momento:

1. Inclusión de etiquetas en la plataforma:
    * En el menú “Mi perfil” de usuarios no diputados ahora hay un campo nuevo “Etiquetas de interés”
    * En la carga y edición de proyectos se agregó el campo “Etiquetas” al final del formulario
    * En la página de inicio, en los filtros de proyectos, ahora se puede filtrar por etiquetas
    * Si los usuarios no tienen ninguna etiqueta asignada se les muestra un aviso
    * Nota: los usuarios y proyectos previos a esta actualización no tendrán asignados ninguna etiqueta
2. Mejoras en el inicio de sesión:
    * Se sacó el botón de “Registrarse” y se dejó únicamente el de “Ingresar” (que antes decía “Iniciar sesión”) en todo el sitio web
    * Se sacó el botón de “Iniciar sesión” y se resaltó la sección que invita a registrarse en el formulario de inicio de sesión
3. Nuevo botón de descarga de excel de los proyectos propios, con sus comentarios y aportes, desde el perfil de usuario	
4. Mejoras de diseño en los filtros de proyectos en la página de inicio
5. Nueva funcionalidad de enviar notificaciones a usuarixs interesadxs al publicar proyecto. Y opción en el perfil de usuario para elegir si recibir estas notificaciones o no.
6. Se arregló un error de que en algunos navegadores, bajo ciertas condiciones, no se guardaban bien las modificaciones del perfil de usuario

Compatible con:
* `leyesabiertas-web:1.8.0`
* `leyesabiertas-notifier:1.8.0`
* `leyesabiertas-keycloak:1.8.0`


**1.7.1**

- Mejorado como se loguean los errores del notifier

_Compatible con leyesabiertas-notifier:1.7.1 y leyesabiertas-web:1.7.1_


**1.7.0**

- Agregado sort querystring y otros controles del paginado en /documents/my-documents

_Compatible con leyesabiertas-notifier:1.5.0 y leyesabiertas-web:1.7.0_


**1.6.0**

- Ahora al iniciar el servidor, hay una nueva rutina que actualiza los fields de un custom form, por si hay nuevos campos que ir agregando en el tiempo. En este caso, se agrego `customVideoId` que seria la url que funciona con el reproductor para el servidor de streaming para la HCDN. 
- En cambio, `youtubeId` aun se mantendra por razones de compatibilidad con la BD.

**1.5.0**

- Ahora `GET /documents` cambio su forma de obtener y paginar los resultados que obtiene. En coordinacion con el front, ahora los resultados se paginan, y se fuerza el orden de que en primer lugar aparecen las propuestas abiertas, y luego, las cerradas. Se descarta entonces el uso de "mongoose-paginate" para este caso, lamentablemente el paquete limita mucho llevar a cabo queries complejas.
- Agregado "closed" atributo a todos los documentos que devuelve el API endpoint `/my-documents` 

_Compatible con leyesabiertas-notifier:1.3.0 y leyesabiertas-web:1.5.0_

**1.4.0**

- DERLA-33 Nuevo feature: Poder navegar por las versiones historicas del documento (Agregado obtener la version de un documento)

_Compatible con leyesabiertas-notifier:1.3.0 y leyesabiertas-web:1.4.0_

**1.3.1**

- DERLA-65 Fix error stack=TypeError: timeago is not a function & cannot mongoose.connect() multiple times while connected

_Compatible solo con leyesabiertas-notifier:1.3.0 y leyesabiertas-web:1.3.0_

**1.3.0**

* Se hizo un FIX donde el link a la propuesta se parseaba como `Object` y habia que sacar el `id`
* DERLA-58 Se agrego el feature de que se envia un correo al diputado al recibir un comentario tanto en fundamentacion como contextual.
* Se hizo un FIX en el saludo, donde a veces no existia nombre a quien saludar.

_Compatible solo con leyesabiertas-notifier:1.3.0 y leyesabiertas-web:1.3.0_

**1.1.3**

- Fixed contributors count at the end of a project

**1.1.2**

- Fixed not being able to create new document versions

**1.1.1**

- Fixed the payload sent to the notifier for document-closes notificaton. Syncs with leyesabiertas-notifier:1.1.2