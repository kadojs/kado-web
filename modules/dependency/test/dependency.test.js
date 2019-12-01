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


/**
 * CLI tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 */
exports.cli = (K,expect,request,exec) => {
  describe('dependency cli',() => {
    let dependencyId = null
    after(() => {
      if(dependencyId) return exec('node app dependency remove -i ' + dependencyId)
    })
    it('should allow dependency creation from cli',() => {
      return exec('node app dependency create -t test -c test')
        .then((result) => {
          expect(result).to.match(/Dependency entry created: \d+/)
          dependencyId = result.match(/Dependency entry created: (\d+)/)[1]
        })
    })
    it('should allow dependency change from cli',() => {
      return exec('node app dependency update -i ' + dependencyId + ' -t test2 -c test')
        .then((result) => {
          expect(result).to.match(/Dependency entry updated successfully!/i)
        })
    })
    it('should allow dependency deletion from cli',() => {
      return exec('node app dependency remove -i ' + dependencyId)
        .then((result) => {
          expect(result).to.match(/Dependency entry removed successfully!/i)
          dependencyId = null
        })
    })
  })
}


/**
 * Admin tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 * @param {function} params - An Object containing test specific
 */
exports.admin = (K,expect,request,exec,params) => {
  //expand some parameters
  let adminBaseUrl = params.admin.baseUrl
  let adminCookieJar = params.admin.cookieJar
  let doLogin = params.admin.doLogin
  describe('dependency admin',() => {
    let dependencyId = null
    let removeDependency = () => {
      return request.postAsync({
        url: adminBaseUrl + '/dependency/remove?id=' + dependencyId,
        jar: adminCookieJar,
        json: true
      })
        .then((res) => {
          expect(res.body.success).to.match(/Dependency\(s\) removed/)
          dependencyId = null
        })
    }
    before(() => {
      if(!adminCookieJar._isLoggedIn) return doLogin()
    })
    after(() => {
      if(dependencyId) removeDependency()
    })
    it('should list',() => {
      return request.getAsync({
        url: adminBaseUrl + '/dependency/list',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Dependency/)
        })
    })
    it('should show creation page',() => {
      return request.getAsync({
        url: adminBaseUrl + '/dependency/create',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Create Entry/)
        })
    })
    it('should allow creation',() => {
      return request.postAsync({
        url: adminBaseUrl + '/dependency/save',
        jar: adminCookieJar,
        json: {
          title: 'Test Dependency',
          uri: 'test-dependency',
          content: 'testing the dependency',
          html: '<p>testing the dependency</p>'
        }
      })
        .then((res) => {
          expect(+res.body.dependency.id).to.be.a('number')
          dependencyId = +res.body.dependency.id
        })
    })
    it('should allow modification',() => {
      return request.postAsync({
        url: adminBaseUrl + '/dependency/save',
        jar: adminCookieJar,
        json: {
          id: dependencyId,
          title: 'Test dependency 2',
          uri: 'test-dependency-2',
          content: 'testing the dependency 2',
          html: '<p>testing the dependency 2</p>'
        }
      })
        .then((res) => {
          expect(res.body.dependency.id).to.be.a('number')
          expect(+res.body.dependency.id).to.equal(dependencyId)
        })
    })
    it('should allow deletion',() => {
      return removeDependency()
    })
  })
}


/**
 * Main tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 * @param {function} params - An Object containing test specific
 */
exports.main = (K,expect,request,exec,params) => {
  //expand some parameters
  let mainBaseUrl = params.main.baseUrl
  let mainCookieJar = params.main.cookieJar
  describe('dependency main',() => {
    let dependencyId = null
    before(() => {
      return exec('node app dependency create -t test -c test')
        .then((result) => {
          expect(result).to.match(/Dependency entry created: \d+/)
          dependencyId = result.match(/Dependency entry created: (\d+)/)[1]
        })
    })
    after(() => {
      return exec('node app dependency remove -i ' + dependencyId)
        .then((result) => {
          expect(result).to.match(/Dependency entry removed successfully!/i)
          dependencyId = null
        })
    })
    it('should allow viewing',() => {
      return request.getAsync({
        url: mainBaseUrl + '/dependency/test',
        jar: mainCookieJar
      })
        .then((res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.body).to.match(/test/)
        })
    })
  })
}
