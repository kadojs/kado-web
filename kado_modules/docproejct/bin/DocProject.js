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
const K = require('kado')

const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let DocProject = sequelize.models.DocProject

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','Doc Project Title')
  .option('-c, --content <s>','Doc Project Content')
  .description('Create new docproejct entry')
  .action((opts) => {
    P.try(() => {
      log.info('Creating docproejct entry')
      let doc = {
        name: opts.name,
        active: true
      }
      return DocProject.create(doc)
    })
      .then((result) => {
        log.info('Doc Project entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Failed to create docproejct entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','Doc Project Id')
  .option('-t, --title <s>','Doc Project Title')
  .option('-c, --content <s>','Doc Project Content')
  .description('Update existing docproejct entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Doc Project id is required')
    DocProject.find({where: {id: opts.id}})
      .then((result) => {
        let doc = result
        if(opts.name) doc.name = opts.name
        return doc.save()
      })
      .then(() => {
        log.info('Doc Project entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save docproejct entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','Doc Project Id to remove')
  .description('Remove docproejct entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Doc Project Id is required... exiting')
    DocProject.destroy({where: {id: opts.id}})
      .then(() => {
        log.info('Doc Project entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not remove docproejct entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List docproejct entries')
  .action(() => {
    let table = new Table({
      head: [
        'Id',
        'Name',
      ]
    })
    let count = 0
    DocProject.findAll()
      .each((row) => {
        count++
        table.push([
          row.id,
          row.title,
          row.content.replace(/<(?:.|\n)*?>/gm, '').substring(0,50),
          row.active ? 'Yes' : 'No'
        ])
      })
      .then(() => {
        if(!count) table.push(['No docproejct entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not list docproejct entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
