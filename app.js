'use strict';
const K = require('kado')
const fs = require('fs')
//application config
K.configure({
  root: __dirname,
  interface: {
    admin: { enabled: true },
    main: { enabled: true }
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
