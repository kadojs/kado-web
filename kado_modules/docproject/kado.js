'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */

//module properties
exports._kado = {
  enabled: true,
  name: 'docproject',
  title: 'Doc Project',
  description: 'Manage and publish docproject entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    docproject: {
      title: 'Kado Doc Project'
    }
  })
}


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 */
exports.db = (K,db) => {
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/models/DocProject.js')
}


/**
 * Provide search
 * @param {K} K Master Kado Object
 * @param {app} app
 * @param {array} keywords
 * @param {number} start
 * @param {number} limit
 * @return {Promise}
 */
exports.search = (K,app,keywords,start,limit) => {
  let s = K.db.sequelize
  let DocProject = s.models.DocProject
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return DocProject.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.id,
      description: r.id,
      uri: app.uri.get('/docproject/edit') + '?id=' + r.id,
      updatedAt: r.updatedAt
    }})})
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin/index')
  //register permissions
  app.permission.add('/docproject/create','Create docproject')
  app.permission.add('/docproject/save','Save docproject')
  app.permission.add('/docproject/list','List docproject')
  app.permission.add('/docproject/edit','Edit docproject')
  app.permission.add('/docproject/remove','Remove docproject')
  //register views
  app.view.add('docproject/create',__dirname + '/admin/view/create.html')
  app.view.add('docproject/edit',__dirname + '/admin/view/edit.html')
  app.view.add('docproject/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/docproject'),'Doc Project','')
  app.nav.addItem('Doc Project',app.uri.add('/docproject/list'),'List','list')
  app.nav.addItem('Doc Project',app.uri.add('/docproject/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/docproject'),(req,res) => {
    res.redirect(301,app.uri.get('/docproject/list'))
  })
  app.get(app.uri.get('/docproject/list'),admin.list)
  app.get(app.uri.get('/docproject/create'),admin.create)
  app.get(app.uri.add('/docproject/edit'),admin.edit)
  app.post(app.uri.add('/docproject/save'),admin.save)
  app.post(app.uri.add('/docproject/remove'),admin.remove)
  app.get(app.uri.get('/docproject/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register routes
  app.get(app.uri.add('/docproject'),main.index)
  app.get(app.uri.add('/docproject/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/docproject'),'Doc Project','')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/docproject')
}

