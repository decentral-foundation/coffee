var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/test"
var monk = require("monk");
var db = monk(url);
var fs = require("fs");

var addLocationTo = function( record ) {
    record.location = {
        type: "Point",
        coordinates: [ record.longitude, record.latitude ]
    };
    return record;
};

var insertDocuments = function(db, callback) {
    var data = fs.readFileSync( "data/locations.csv", "utf8") 
    data = data.split(/\r?\n/);
    var collection = db.get("coffee");
    collection.remove({});
    var records = [];
    for (var i in data) {
        var item = data[i].split(/,\s/);
        var record = {
            id:        parseInt(item[0]),
            name:      item[1],
            address:   item[2],
            latitude:  parseFloat(item[3]),
            longitude: parseFloat(item[4]) };
        record = addLocationTo( record );
        records.push( record )
    }
    collection.insert( records ).then((doc) => {
        console.log('doc::',doc );
        MongoClient.connect( url, function(err, mdb) {
            if (err) { 
                console.log("err detected: ",err);
                console.log(err); 
            }
            console.log("'mdb: ",mdb);
            var collection = mdb.collection("coffee");
            console.log("123123");
            collection.createIndex({ location: "2dsphere" }, function() {
                console.log("is the callback being hit?");
                mdb.close(true);
            });
        });
    }).catch((err) => {
        console.log( err );
    }).then(() => {
        db.close(true);  
    });
};

insertDocuments( db );
