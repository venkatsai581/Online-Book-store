const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('database/db.json');
const middlewares = jsonServer.defaults({ noCors: false }); // Enable CORS

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running at http://localhost:3000');
});