'use strict';
const fs = require('fs')
const KadoUI = require('kado-ui')
const ObjectManage = require('object-manage')
const config = new ObjectManage(KadoUI.config())
const configLocal = __dirname + '/config.local.js'
const viewFolder = __dirname + '/main/view'

config.$load({
  admin: {
    enabled: true
  },
  main: {
    enabled: true,
    pageTitle: 'Module system for Node.js, Better than Wordpress - Kado',
    staticRoot: [
      __dirname + '/main/public'
    ],
    addCss: [
      {uri: '/assets/css/fonts.css'},
      {uri: '/assets/themify-icons/themify-icons.min.css'},
      {uri: '/assets/css/metisMenu.min.css'},
      {uri: '/assets/css/magnific-popup.min.css'},
      {uri: '/assets/OwlCarousel2/owl.carousel.min.css'},
      {uri: '/assets/OwlCarousel2/owl.theme.default.min.css'},
    ],
    override: {
      view: {
        //blog views
        'blog/entry': viewFolder + '/blog/entry.html',
        'blog/list': viewFolder + '/blog/list.html',
        //content views
        'content/entry': viewFolder + '/content/entry.html',
        //add a separate layout system for the documentation portion
        'doc_header': viewFolder + '/doc_header.html',
        'doc_footer': viewFolder + '/doc_footer.html',
        'doc_navbar': viewFolder + '/doc_navbar.html',
        //actually replace the stock document views
        'doc/project/list': viewFolder + '/doc/project/list.html',
        'doc/entry': viewFolder + '/doc/entry.html',
        'doc/list': viewFolder + '/doc/list.html',
        'doc/versionList': viewFolder + '/doc/versionList.html',
        //override error handler
        'error': viewFolder + '/error.html',
        //override home page
        'home': viewFolder + '/home.html',
        //add common layout helper
        'css': viewFolder + '/css.html',
        'js': viewFolder + '/js.html',
        'nav': viewFolder + '/nav.html',
        //global header and footer
        'footer': viewFolder + '/footer.html',
        'header': viewFolder + '/header.html',
        'search': viewFolder + '/search.html'
      }
    }
  }
})

if(fs.existsSync(configLocal)) config.$load(require(configLocal))
if(process.env.KADO_CONFIG) config.$load(require(process.env.KADO_COINFIG))

module.exports = config.$strip()
