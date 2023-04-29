"use strict";

var mongo       = require("mongodb");
var MongoClient = mongo.MongoClient;
var url         = "mongodb://localhost:27017/test";
var monk        = require("monk");
var db          = monk(url);
var request     = require("request");
var GoogleMapsAPI = require("googlemaps");
var express     = require("express");
var bodyParser  = require('body-parser');

require('dotenv').config()
var app = express();
app.use(bodyParser.json()); // for parsing application/json

app.use(function(req, res, next){
    req.db = db;
    next();
});

var addLocationTo = function( record ) {
    record.location = {
        type: "Point",
        coordinates: [ record.longitude, record.latitude ]
    };
    return record;
};

app.post("/api/create", function( req, res ) {
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({}, {sort:{id:-1},limit:1}).then((doc) => {
        var result = doc[0];
        var record = {
            id        : result.id + 1,
            name      : req.body.name,
            address   : req.body.address,
            latitude  : parseFloat(req.body.latitude),
            longitude : parseFloat(req.body.longitude) };
        record = addLocationTo( record );
        collection.insert( record ).then((doc) => {
            res.status(200).json( record );
        }).catch((err) => {
            res.status(500).json({});
        });
    }).catch((err) => {
        res.status(500).json({});
    });
});

app.get("/api/read", function( req, res ) {
    var id = parseInt(req.query.id);
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({id:id}, {limit:1}).then((doc) => {
        var result = doc[0];
        res.status(200).json(result);
    }).catch((err) => {
        res.status(404).json({});
    });
});

app.put("/api/update", function (req,res) {
    var id = parseInt(req.body.id);
    var db = req.db;
    var record = {
        id        : id,
        name      : req.body.name,
        address   : req.body.address,
        latitude  : parseFloat(req.body.latitude),
        longitude : parseFloat(req.body.longitude) 
    };
    var collection = db.get("coffee");
    const filter = { id: '33' };
    const update = { $set: record };
    collection.update(filter, update, {upsert: true})
      .then((result) => {
        db.close();
        res.status(200).json(result)
      })
      .catch((err) => {
        db.close();
        res.status(404).json({});
      });
})


app.delete("/api/delete", function( req, res ) {
    var id = parseInt(req.body.id);
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({id:id}).then((doc) => { 
        var result = doc[0];
        collection.remove( result ).then((doc) => {
            res.status(200).json({});
        }).catch(() => {
            res.status(404).json({});
        });
    }).catch((err) => {
        res.status(404).json({});
    });
});

/**
 * 
 * This code defines an API endpoint ("/api/nearest") that takes an address as input, retrieves the geographic coordinates (latitude and longitude) of the address using the Google Maps geocoding API, and then uses those coordinates to query a MongoDB database for the nearest coffee shop.
 * First, it extracts the address from the HTTP request body and sets the Google Maps API key. It then creates a GoogleMapsAPI object with the public configuration settings. Next, it defines the geocode parameters for the Google Maps API and retrieves the geocoded data from Google. From the geocoded data, it extracts the longitude and latitude coordinates and constructs a MongoDB query using these coordinates.
 * Finally, it connects to the MongoDB database and executes the query to find the nearest coffee shop. If the query is successful, it returns the coffee shop details in JSON format with a HTTP status code of 200. If there is an error, it returns an empty object with a HTTP status code of 404.
 */
app.get("/api/nearest", function( req, res ) {
    console.log(" hello world");
    const GM_API_KEY = process.env.GM_API_KEY;
    var address = req.body.address;
    console.log("address: ",address);
    var key = GM_API_KEY;
    var form = { form: { address: address, key: key } };
    var publicConfig = {
        key: key,
        stagger_time:       1000, // for elevationPath
        encode_polylines:   false,
        secure:             true, // use https
    };
    var gmAPI = new GoogleMapsAPI(publicConfig);
    // geocode API
    var geocodeParams = {
        address: address,
    };
    


    gmAPI.geocode(geocodeParams, function(err, result) {
        console.log("result: ",result);
        // parse the geocoded data from Google
        var result = result.results[0];
        var lng = result.geometry.location.lng;
        var lat = result.geometry.location.lat;
        console.log("lat,lng",lat,lng);
        // feed lng/lat into mongodb query
        


        var db = req.db;
        var collection = db.get("coffee");
        let myquery = { point: { 
                            $near: { 
                                $geometry: { 
                                    type: "Point", 
                                    coordinates: [ lng, lat ] 
                                },
                                $maxDistance: 50000
                            } 
                        } 
                    };
        console.log("myquery: ",myquery)
        collection.find(myquery).then((doc) => { 
            console.log("new doc: ",doc);
            var result = doc[0];
            collection.remove( result ).then((doc) => {
                res.status(200).json({});
            }).catch(() => {
                res.status(404).json({});
            });
        }).catch((err) => {
            console.log("err: ",err);
            res.status(404).json({});
        });





        MongoClient.connect( url, function(err, mdb) {
            if (err) { console.log(err); }
            var collection = mdb.collection("coffee");
            var query = { location: { 
                            $near: { 
                                $geometry: { 
                                    type: "Point", 
                                    coordinates: [ lng, lat ] 
                                },
                            } 
                        } 
                    };
            console.log("query: ",query);
            collection.findOne(query, (err,result) => {
                if (err) {
                    console.error(err);
                    res.status(404).json({});
                    return;
                }
                console.log(" final result: ",result);
                res.status(200).json(result);
                client.close()
            })
        });
    });
});


module.exports = app;
