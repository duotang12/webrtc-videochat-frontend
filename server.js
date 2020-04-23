//Install express server
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('./dist/{{your-app-name}}'));

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname,'/dist/{{your-app-name}}/index.html'));
});

app.listen(4200);
