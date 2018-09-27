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
          'doc_breadcrumb': viewFolder + '/doc_breadcrumb.html',
          'doc_header': viewFolder + '/doc_header.html',
          'doc_footer': viewFolder + '/doc_footer.html',
          'doc_navbar': viewFolder + '/doc_navbar.html',
          'css': viewFolder + '/css.html',
          'footer': viewFolder + '/footer.html',
          'header': viewFolder + '/header.html',
          'home': viewFolder + '/home.html',
          'js': viewFolder + '/js.html',
          'nav': viewFolder + '/nav.html'
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
if(process.env.KADOWEB_CONFIG) K.configure(process.env.KADOWEB_CONFIG)
//start application
K.go('kado-web')
