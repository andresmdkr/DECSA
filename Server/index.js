const server = require("./src/app.js");
const { conn } = require("./src/db.js");

const { SERVER_PORT } = process.env || 3001; 
conn.sync({ alter: true })
  .then(() => {
    server.listen(SERVER_PORT, () => {
      console.log(`Server is listening on port: ${SERVER_PORT}`);
    });
  })
  .catch(error => {
    console.error("Error syncing with the database:", error);
  });


/*   const server = require("./src/app.js");
const { conn } = require("./src/db.js");

const { SERVER_PORT } = process.env || 3001;


conn.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');

    server.listen(SERVER_PORT, () => {
      console.log(`Server is listening on port: ${SERVER_PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  }); */