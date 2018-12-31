fis.match('*.{png,js,css}', {
  useHash: true,
  release: 'static/$0'
});

fis.match('*.js', {
  optimizer: fis.plugin('uglify-js')
})

fis.match('*.css', {
  useSprite: true,
  optimizer: fis.plugin('clean-css')
});

fis.match('*.png', {
  optimizer: fis.plugin('png-compressor')
});

fis.match('::package', {
  spriter: fis.plugin('csssprites')
})