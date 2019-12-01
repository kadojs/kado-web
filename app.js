'use strict';
const config = require('./config')
const KadoUI = require('kado-ui')
if(require.main === module){
  KadoUI.app(config,__dirname + '/main',__dirname + '/admin')
}
