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
      enabled: true
    }
  },
  module: {
    blog: { enabled: false },
    setting: { enabled: true },
    staff: { enabled: true }
  }
})
//load env config
let localConfig = __dirname + '/config.local.js'
if(fs.existsSync(localConfig)) K.configure(require(localConfig))
if(process.env.KADOWEB_CONFIG) K.configure(process.env.KADOWEB_CONFIG)
K.go('kado-web')
