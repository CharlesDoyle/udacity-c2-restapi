import express from 'express';
// import dequelize.ts, which runs the script and instantiates Sequelize()
// sequelize is now an object with a connection to our sql db at AWS
import { sequelize } from './sequelize'; // src/sequelize

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';

import { V0MODELS } from './controllers/v0/model.index';

// sequelize can now start adding our table models
(async () => {
  await sequelize.addModels(V0MODELS); // wait on this line until it completes

  // apply the migrations to make sure our db is in-sync with our models.  If a 
  // db table model has changed, whether different cols, more/less rows, or new data, we won't 
  // be able to do correct db operations.
  // Sync all models as currently defined to the db by running all migrations, from 
  // oldest to newest.  
  await sequelize.sync(); // refresh the remote db with our latest migration info

  const app = express();
  // process object probably comes from 'import express'
  const port = process.env.PORT || 8080; // default port to listen
  
  app.use(bodyParser.json()); // allows us to read json objects in the body of requests

  //CORS Should be restricted: only allow requests to the DB from localhost:8100 
  // Each request coming in will have this CORS policy in the header 
  // allow 5 specific fields in a header?
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  // the root URI for our app is {{host}}/api/v0/     
  // when /api/v0/...  is encountered, use IndexRouter to route the various endpoints 
  app.use('/api/v0/', IndexRouter)

  // a GET request to {{host}}/     
  // send back a simple welcome message to anyone to accesses the root
  app.get( "/", async ( req, res ) => {
    res.send( "Welcome to /api/v0/" );
  } );
  

  // Start the Server at port 8080
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();