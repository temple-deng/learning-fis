fis.match('*.less', {
  parser: fis.plugin('less'),
  rExt: '.css'
});

fis.match('::packager', {
  postpackager: fis.plugin('loader')
})

fis.match('*.{less,css}', {
  packTo: '/static/aio.css'
});

fis.match('*.js', {
  packTo: '/static/aio.js'
});

fis.match('*.html', {
  useMap: true
})