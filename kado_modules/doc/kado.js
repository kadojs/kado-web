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
  name: 'doc',
  title: 'Doc',
  description: 'Manage and publish doc entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    doc: {
      title: 'Kado Doc'
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
  db.sequelize.import(__dirname + '/models/Doc.js')
  db.sequelize.import(__dirname + '/models/DocRevision.js')
  let Doc = db.sequelize.models.Doc
  let DocRevision = db.sequelize.models.DocRevision
  Doc.hasMany(DocRevision,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocRevision.belongsTo(Doc,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
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
  let Doc = s.models.Doc
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return Doc.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.id,
      description: r.id,
      uri: app.uri.get('/doc/edit') + '?id=' + r.id,
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
  app.permission.add('/doc/create','Create Doc')
  app.permission.add('/doc/save','Save Doc')
  app.permission.add('/doc/list','List Doc')
  app.permission.add('/doc/edit','Edit Doc')
  app.permission.add('/doc/remove','Remove Doc')
  //register views
  app.view.add('doc/create',__dirname + '/admin/view/create.html')
  app.view.add('doc/edit',__dirname + '/admin/view/edit.html')
  app.view.add('doc/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/doc'),'Doc','')
  app.nav.addItem('Doc',app.uri.add('/doc/list'),'List','list')
  app.nav.addItem('Doc',app.uri.add('/doc/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/doc'),(req,res) => {
    res.redirect(301,app.uri.get('/doc/list'))
  })
  app.get(app.uri.get('/doc/list'),admin.list)
  app.get(app.uri.get('/doc/create'),admin.create)
  app.get(app.uri.add('/doc/edit'),admin.edit)
  app.post(app.uri.add('/doc/save'),admin.save)
  app.post(app.uri.add('/doc/remove'),admin.remove)
  app.get(app.uri.get('/doc/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register routes
  app.get(app.uri.add('/doc'),main.index)
  app.get(app.uri.add('/doc/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/doc'),'Doc','')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/doc')
}

