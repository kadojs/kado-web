'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
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
  name: 'dependency',
  title: 'Dependency',
  description: 'Manage and publish dependency entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    dependency: {
      title: 'Kado Dependency'
    }
  })
}


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 * @param {K.db.sequelize} s Sequelize instance
 */
exports.db = (K,db,s) => {
  s.doImport(__dirname + '/models/Dependency.js')
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
  let Dependency = s.models.Dependency
  let where = {[s.Op.or]: []}
  keywords.map((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return Dependency.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.id,
      description: r.id,
      uri: app.uri.get('/dependency/edit') + '?id=' + r.id,
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
  app.permission.add('/dependency/create','Create Dependency')
  app.permission.add('/dependency/save','Save Dependency')
  app.permission.add('/dependency/list','List Dependency')
  app.permission.add('/dependency/edit','Edit Dependency')
  app.permission.add('/dependency/remove','Remove Dependency')
  //register views
  app.view.add('dependency/create',__dirname + '/admin/view/create.html')
  app.view.add('dependency/edit',__dirname + '/admin/view/edit.html')
  app.view.add('dependency/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.p('/dependency'),'Dependency','')
  app.nav.addItem('Dependency',app.uri.p('/dependency/list'),'List','list')
  app.nav.addItem('Dependency',app.uri.p('/dependency/create'),'Create','plus')
  //register routes
  app.get(app.uri.p('/dependency'),(req,res) => {
    res.redirect(301,app.uri.p('/dependency/list'))
  })
  app.get(app.uri.p('/dependency/list'),admin.list)
  app.get(app.uri.p('/dependency/create'),admin.create)
  app.get(app.uri.p('/dependency/edit'),admin.edit)
  app.post(app.uri.p('/dependency/save'),admin.save)
  app.post(app.uri.p('/dependency/remove'),admin.remove)
  app.get(app.uri.p('/dependency/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register views
  app.view.add('dependency/entry',__dirname + '/main/view/entry.html')
  app.view.add('dependency/list',__dirname + '/main/view/list.html')
  app.view.add('document',__dirname + '/main/view/docs.html')
  //register routes
  app.get(app.uri.p('/dependency'),main.index)
  app.get(app.uri.p('/document'),main.docs)
  app.post(app.uri.p('/dependency/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.p('/dependency'),'Dependency','')
}


/**
 * CLI Access
 */
exports.cli = () => {
  require('./cli/dependency')
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
