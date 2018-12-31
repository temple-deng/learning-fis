fis.match('*.{png,js,css}', {
  release: 'static/$0',
  domain: 'https://cdn.example.com',
  url: '/public/static/$0'
});