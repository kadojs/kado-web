'use strict';
const K = require('kado')
const fs = require('fs')
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
      enabled: true,
      scriptServer: [
        'markdown-it',
        'to-mark',
        'codemirror',
        'highlight.js',
        'squire-rte',
        'tui-code-snippet',
        'tui-editor',
        'to-mark'
      ]
    },
    main: {
      enabled: true,
      staticRoot: [
        __dirname + '/interface/main/public'
      ],
      override: {
        view: {
          'footer': __dirname + '/interface/main/view/footer.html',
          'header': __dirname + '/interface/main/view/header.html',
          'navbar': __dirname + '/interface/main/view/navbar.html'
        }
      }
    }
  },
  module: {
    blog: { enabled: true },
    setting: { enabled: true },
    staff: { enabled: true }
  }
})
//load env config
let localConfig = __dirname + '/config.local.js'
if(fs.existsSync(localConfig)) K.configure(require(localConfig))
if(process.env.KADOWEB_CONFIG) K.configure(process.env.KADOWEB_CONFIG)
K.go('kado-web')
