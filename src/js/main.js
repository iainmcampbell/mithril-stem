var m = require('mithril')

var home = require('app/views/home')

m.route(document.querySelector('.container'), '/', {
  '/': home,
})