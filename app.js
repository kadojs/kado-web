'use strict';
const K = require('kado')
let viewFolder = __dirname + '/interface/main/view'
//application config
K.configure({
  root: __dirname,
  db: {
    sequelize: {
      name: 'kadoweb',
      user: 'kadoweb',
      password: 'kadoweb'
    }
  },
  interface: {
    admin: {
      enabled: true
    },
    main: {
      enabled: true,
      staticRoot: [
        __dirname + '/interface/main/public'
      ],
      override: {
        view: {
          //blog views
          'blog/entry': viewFolder + '/blog/entry.html',
          'blog/list': viewFolder + '/blog/list.html',
          //content views
          'content/entry': viewFolder + '/content/entry.html',
          //add a separate layout system for the documentation portion
          'doc_header': viewFolder + '/doc_header.html',
          'doc_footer': viewFolder + '/doc_footer.html',
          'doc_navbar': viewFolder + '/doc_navbar.html',
          //actually replace the stock document views
          'doc/project/list': viewFolder + '/doc/project/list.html',
          'doc/entry': viewFolder + '/doc/entry.html',
          'doc/list': viewFolder + '/doc/list.html',
          'doc/versionList': viewFolder + '/doc/versionList.html',
          //override error handler
          'error': viewFolder + '/error.html',
          //override home page
          'home': viewFolder + '/home.html',
          //add common layout helper
          'css': viewFolder + '/css.html',
          'js': viewFolder + '/js.html',
          'nav': viewFolder + '/nav.html',
          //global header and footer
          'footer': viewFolder + '/footer.html',
          'header': viewFolder + '/header.html',
          'search': viewFolder + '/search.html'
        }
      }
    }
  },
  module: {
    blog: { enabled: true },
    content: {enabled: true},
    doc: {enabled: true},
    setting: { enabled: true },
    staff: { enabled: true }
  }
})
//load env config
let localConfig = __dirname + '/config.local.js'
if(K.fs.existsSync(localConfig)) K.configure(require(localConfig))
if(process.env.KADO_CONFIG) K.configure(process.env.KADO_CONFIG)
//start application
K.go('kado-web')
