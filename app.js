'use strict';
const K = require('kado')
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
          'breadcrumb': __dirname + '/interface/main/view/breadcrumb.html',
          'footer': __dirname + '/interface/main/view/footer.html',
          'header': __dirname + '/interface/main/view/header.html',
          'navbar': __dirname + '/interface/main/view/navbar.html'
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
