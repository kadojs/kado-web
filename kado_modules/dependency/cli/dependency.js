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
const K = require('kado')

const P = require('bluebird')
const Table = require('cli-table')
const program = require('commander')

let log = K.log
let sequelize = K.db.sequelize

let Dependency = sequelize.models.Dependency

let config = K.config

//create
program
  .command('create')
  .option('-t, --title <s>','Dependency Title')
  .option('-c, --content <s>','Dependency Content')
  .description('Create new dependency entry')
  .action((opts) => {
    P.try(() => {
      log.info('Creating dependency entry')
      let doc = {
        name: opts.name,
        url: opts.url,
      }
      return Dependency.create(doc)
    })
      .then((result) => {
        log.info('Dependency entry created: ' + result.id)
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Failed to create dependency entry: ' + err)
        process.exit()
      })
  })
//update
program
  .command('update')
  .option('-i, --id <s>','Dependency Id')
  .option('-t, --title <s>','Dependency Title')
  .option('-c, --content <s>','Dependency Content')
  .description('Update existing dependency entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Dependency id is required')
    Dependency.findByPk(opts.id)
      .then((result) => {
        let doc = result
        if(opts.name) doc.name = opts.name
        if(opts.url) doc.url = opts.url
        return doc.save()
      })
      .then(() => {
        log.info('Dependency entry updated successfully!')
        process.exit()
      })
      .catch((err) => {
        if(err) throw new Error('Could not save dependency entry: ' + err)
      })
  })
//remove
program
  .command('remove')
  .option('-i, --id <s>','Dependency Id to remove')
  .description('Remove dependency entry')
  .action((opts) => {
    if(!opts.id) throw new Error('Dependency Id is required... exiting')
    Dependency.destroy({where: {id: opts.id}})
      .then(() => {
        log.info('Dependency entry removed successfully!')
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not remove dependency entry: ' + err)
      })
  })
//list
program
  .command('list')
  .description('List dependency entries')
  .action(() => {
    let table = new Table({
      head: [
        'Id',
        'name',
        'url',
      ]
    })
    let count = 0
    Dependency.findAll()
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
        if(!count) table.push(['No dependency entries'])
        console.log(table.toString())
        process.exit()
      })
      .catch((err) => {
        log.error('Error: Could not list dependency entries ' +
          err.stack)
        process.exit()
      })
  })
program.version(config.version)
let cli = program.parse(process.argv)
if(!cli.args.length) program.help()
