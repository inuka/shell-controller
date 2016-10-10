var mongo = require('mongodb');
var Client = require('ssh2').Client;

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var ssh_conn = { host: '127.0.0.1', port: 22, username: 'inuka', password: 'Panda2010' }

var server = new Server('localhost', 27017, {auto_reconnect:true});
db = new Db('packages_db', server);


db.open(function(err, db){
  if(!err){
    console.log("Connected to 'packages_db' database");
    db.collection('packages', {strict:true}, function(err, collection){
      if(err){
        console.log("The 'packages' collection doesn't exist. Creating it with sample data...");
        populateDB();
      }
    });
  }
});

exports.findById = function(req, res){
  var id = req.params.id;
  console.log('Retrieving package: ' + id);
  db.collection('packages', function(err, collection) {
        collection.findOne({'_id':new mongo.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};


exports.findAll = function(req,res) {
  console.log('Retrieving packages');

//start ssh code
  var conn = new Client();
  conn.on('ready', function() {
    console.log('Client :: ready');
    conn.exec('pwd', function(err, stream) {
      if (err) throw err;
      stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        conn.end();
      }).on('data', function(data) {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });
    });
  }).connect(ssh_conn);
//end ssh code

  db.collection('packages', function(err,collection){
    collection.find().toArray(function(err,items){
      res.send(items);
    });
  });
};

exports.addPackges = function(req,res){
  console.log('Adding package request');
  var pkg = req.body;
  console.log('Adding package request: ' + JSON.stringify(pkg));
  db.collection('packages',function(err, collection){
    collection.insert(pkg, {safe:true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        console.log('Success: ' + JSON.stringify(result[0]));
        res.send(result[0]);
      }
    });
  });
}


exports.updatePackages = function(req, res) {
    var id = req.params.id;
    var pkg = req.body;
    console.log('Updating package: ' + id);
    console.log(JSON.stringify(pkg));
    db.collection('packages', function(err, collection) {
        collection.update({'_id':new mongo.ObjectID(id)}, pkg, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating package: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(pkg);
            }
        });
    });
}

exports.deletePackages = function(req, res) {
    var id = req.params.id;
    console.log('Deleting package: ' + id);
    console.log('Fuck');
    db.collection('packages', function(err, collection) {
        collection.remove({'_id':new mongo.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}


/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var packages = [
    {
      client: "digicel",
      project_code: "DIG_HT_01",
      country: "haiti",
      product: "snd0.9",
      created_datetime: "2016-08-14T16:00:49Z",
      download_link: "dig_ht_01_snd_0.9_platform_1.0.tar.gz",
      log_file_link: "1.txt"
    },
    {
      client: "digicel",
      project_code: "DIG_HT_01",
      country: "haiti",
      product: "snd1.0",
      created_datetime: "2016-08-12T16:00:49Z",
      download_link: "dig_ht_01_snd_1.0_platform_1.1.tar.gz",
      log_file_link: "2.txt"
    }];

    db.collection('packages', function(err, collection) {
        collection.insert(packages, {safe:true}, function(err, result) {});
    });

};
