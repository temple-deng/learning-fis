fis.unhook('commonjs');
fis.hook('amd');
fis.match('*.less', {
  parser: fis.plugin('less'),
  rExt: '.css'
});

fis.match('::packager', {
  postpackager: fis.plugin('loader', {
    allInOne: true
  })
})

fis.match('*.{less,css}', {
  packTo: '/static/aio.css'
});

fis.match('*.js', {
  packTo: '/static/aio.js'
});

fis.match('lib/(*.js)', {
  packTo: '/static/lib.js',
  isMod: true,
  release: '/static/lib/$1'
});
