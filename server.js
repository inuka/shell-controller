var express = require('express'),
packages = require('./routes/packages');

var app = express();

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
});

app.get('/packages',packages.findAll);
app.get('/packages/:id',packages.findById);
app.post('/packages', packages.addPackges);
app.put('/packages/:id', packages.updatePackages);
app.delete('/packages/:id', packages.deletePackages);


app.listen(3000);
console.log('Listening on port 3000...');
