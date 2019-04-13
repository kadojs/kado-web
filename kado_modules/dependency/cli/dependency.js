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
program
  .command('populate')
  .option('-p --package <file>','Path to package.json file to read dependencies from')
  .description('Populate dependency list from package.json')
  .action((cmd)=>{
    const cp = require('child_process')
    const updateDependency = (dep) => {
      //steps needed here
      //1) get repository url from package.json
      //2) get the version
      //3) get the readme
      let readme = cp.execSync('npm view ' + dep.name + ' readme')
      let url = cp.execSync('npm view ' + dep.name + ' repository.url')
      let version = cp.execSync('npm view ' + dep.name + ' version')
      dep.readme = readme.toString('utf-8').trim()
      dep.repositoryUrl = url.toString('utf-8').trim()
      dep.version = version.toString('utf-8').trim()
      return dep.save()
        .catch((e) => {
          K.log.warn('Failed to update ' + dep.name + ': ' + e.message)
        })
    }
    const createDependency = (name) => {
      let doc = {
        name: name,
        url: 'https://npmjs.com/package/' + name
      }
      return Dependency.create(doc)
        .then((result) => {
          if(!result) throw new Error('Failed to create dependency')
          doc = result
          return updateDependency(doc)
        })
    }
    K.bluebird.try(()=> {
      if(cmd.package) cmd.package = K.path.resolve(cmd.package)
      if(!cmd.package || !K.fs.existsSync(cmd.package)){
        throw new Error('Package.json not provided')
      }
      let pkg = require(cmd.package)
      if(!pkg || !pkg.dependencies){
        throw new Error('Invalid package.json no dependencies found')
      }
      return Object.keys(pkg.dependencies)
    })
      .map((dep) => {
        K.log.info('Searching for ' + dep)
        return Dependency.findOne({where: {name: dep}})
          .then((result) => {
            if(result){
              K.log.warn(result.name + ' already exists, updating')
              return updateDependency(result)
                .then(() => {
                  K.log.info(dep + ' update complete')
                })
            } else {
              return createDependency(dep)
                .then(() => {
                  K.log.info(dep + ' created successfully')
                })
            }
          })
      },{concurrency: 8})
      .then((result)=>{
        K.log.info('Added ' + result.length + ' dependencies!')
        K.log.info('Dependency population complete')
        process.exit(1)
      })
      .catch((e)=>{
        K.log.error('Failed to populate dependencies: ' + e.message)
        process.exit(1)
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
