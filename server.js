const { createServer } = require('node:http');
const { writeFile, access, constants, readFile } = require('node:fs/promises');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { requestHandler, notFoundContent } = require('./modules/requestHandler');

const serverHost = '127.0.0.1';
const serverPort = 8000;

const signupPageHtml = readFileSync(join(__dirname, '/views/signup.html'));
const signupJs = readFileSync(join(__dirname, '/public/javascripts/signup.js'));

const loginPageHtml = readFileSync(join(__dirname, '/views/login.html'));
const loginJs = readFileSync(join(__dirname, '/public/javascripts/login.js'));

const server = createServer((request, response) => {
  const { method, url: pathname } = request;

  console.info(`${method} ${pathname}`);

  if (method === 'GET') {
    switch (pathname) {
      case '/':
      case '/home':
        requestHandler(response, 'Root Route');
        break;

      case '/signup':
        requestHandler(response, signupPageHtml, 'text/html');
        break;
      case '/signup.js':
        requestHandler(response, signupJs, 'text/javascript');
        break;

      case '/login':
        requestHandler(response, loginPageHtml, 'text/html');
        break;
      case '/login.js':
        requestHandler(response, loginJs, 'text/javascript');
        break;

      default:
        requestHandler(response, notFoundContent, 'text/html', 404);
        break;
    }
  } else if (method === 'POST') {
    if (pathname === '/signup') {
      const body = [];
      request.on('data', (chunk) => {
        body.push(chunk);
      });
      request.on('end', async () => {
        try {
          const requestBody = Buffer.concat(body).toString();
          const user = JSON.parse(requestBody);

          const usersAsText = await readFile(
            join(__dirname, '/users-data.json'),
            'utf-8'
          );
          const users = JSON.parse(usersAsText);

          // add new user
          users.push(user);
          await access(join(__dirname, '/users-data.json'), constants.F_OK);
          await writeFile(
            join(__dirname, '/users-data.json'),
            JSON.stringify(users)
          );

          requestHandler(
            response,
            JSON.stringify({
              status: 'ok',
              data: {
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.firstname
              }
            }),
            'application/json',
            200
          );
        } catch (err) {
          console.error(err);
          requestHandler(
            response,
            JSON.stringify({
              status: 'error',
              error: {
                message: 'internal server error'
              }
            }),
            'application/json',
            500
          );
        }
      });
    } else if (pathname === '/login') {
      // parse request body
      const body = [];
      request.on('data', (chunk) => {
        body.push(chunk);
      });
      request.on('end', async () => {
        try {
          const requestBody = Buffer.concat(body).toString();
          const { username = null, password = null } = JSON.parse(requestBody);

          // consume request body
          // 400: bad request
          if (!username || !password) {
            return requestHandler(
              response,
              JSON.stringify({
                status: 'fail',
                error: {
                  message: 'username or password is invalid'
                }
              }),
              'application/json',
              400
            );
          }

          const usersAsText = await readFile(
            join(__dirname, '/users-data.json'),
            'utf-8'
          );
          const users = JSON.parse(usersAsText);

          const user = users.find((user) => {
            if (username === user.username && password === user.password) {
              return true;
            }
          });

          // 400: bad request
          if (!user) {
            return requestHandler(
              response,
              JSON.stringify({
                status: 'fail',
                error: {
                  message: 'username or password is invalid'
                }
              }),
              'application/json',
              400
            );
          }

          // 200: ok
          requestHandler(
            response,
            JSON.stringify({
              status: 'ok',
              data: {
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username
              }
            }),
            'application/json',
            200
          );
        } catch (err) {
          // 500: internal server error
          console.error(err);

          requestHandler(
            response,
            JSON.stringify({
              status: 'error',
              error: {
                message: 'internal server error'
              }
            }),
            'application/json',
            500
          );
        }
      });
    }
  } else {
    requestHandler(response, notFoundContent, 'text/html', 404);
  }
});

server.listen(serverPort, serverHost, () => {
  console.info(`Listening on ${serverHost}:${serverPort} ...`);
});
