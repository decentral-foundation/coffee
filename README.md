# coffee

A simple Node Express server with testing provided by Supertest and Tape.

This should have a MongoDB server running from the local `./data` directory,

    $ mongod --dbpath=./data

Reload the test data into MongoDB, and perform spatial indexing by running,

    $ node prep
    
Run some tests using,

    $ npm test
    
Starting the server is done by saying,

    $ npm start

# Dev Environment Setup

## Get Mongo Console up and running

### Assuming you have mongo shell already installed via brew

```zsh
mongosh
```

Will open mongo shell in your terminal. 

Common commands

```
show dbs
show collections
use <collection name>
```

# Issues

Backlink: https://mongodb.github.io/node-mongodb-native/5.3/

`insert` should be `insertOne` or `insertMany`