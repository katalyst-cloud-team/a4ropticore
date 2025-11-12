const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get(/.*/, (req, res) => {
  if (/\.\w{2,5}(\?.*)?$/.test(req.url)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});