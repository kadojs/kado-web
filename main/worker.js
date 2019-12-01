'use strict';
const config = require('../config')
const KadoUI = require('kado-ui')
if(require.main === module) KadoUI.worker(config,config.main)
