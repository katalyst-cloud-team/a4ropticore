const express = require('express');
const path = require('path');
const app = express();


const staticPath = path.join(__dirname, 'build');
app.use(express.static(staticPath, {
  index: false,
}));

const spaRoutes = [
  '/',
  '/search',
  '/about',
  '/report',
  '/help',
  '/storagesearch',
  '/events/:uuid',
  '/storage/:ip',
];

spaRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
});

app.get(/.*/, (req, res) => {
  const url = req.url;
d
  if (/\.\w{2,5}$/.test(url)) {
    res.status(404).send('File not found');
  } else {
    // It's a SPA route → serve index.html
    res.sendFile(path.join(staticPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});