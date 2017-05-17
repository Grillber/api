const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');
const md5          = require('md5');

module.exports = (dataLoader) => {
  const authController = express.Router();
  
  // Create a new user (signup)
  authController.post('/users', (req, res) => {
    // console.log(req.body);
    dataLoader.createUser({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      phone: req.body.phone
    })
    .then(user => res.status(201).json(user))
    .catch(function(err){ 
      // Special error handling for duplicate entry
      if(err.code === 'ER_DUP_ENTRY'){
        res.status(400).json('That email already exists')
      }
      return res.status(400).json(err)});
  });


  // Create a new session (login)
  authController.post('/sessions', (req, res) => {
    dataLoader.createTokenFromCredentials(
      req.body.email,
      req.body.password
    )
    .then(token => res.status(201).json({ token: token }))
    .catch(err => res.status(401).json(err));
  });


  // Delete a session (logout)
  authController.delete('/sessions', onlyLoggedIn, (req, res) => {
    if (req.sessionToken === req.body.token) {
      dataLoader.deleteToken(req.body.token)
      .then(() => res.status(204).end())
      .catch(err => res.status(400).json(err));
    } else {
      //console.log(req.sessionToken, "req session token");
      //console.log(req.body, "req body");
      res.status(401).json({ error: 'Invalid session token' });
    }
  });


  // Retrieve current user
  //Gravatar being sent here
  // authController.get('/me', onlyLoggedIn, (req, res) => {
  //   console.log(req.body, "look for token");
  //   dataLoader.getUserFromSession(req.sessionToken)
  //   .then(function(user){ 
  //     user.avatarUrl = 'https://www.gravatar.com/avatar/' + md5(user.users_email.toLowerCase().trim());
  //     //console.log(user);
  //     return user;
  //     } 
  //   )
  //   .then(user => res.status(201).json(user))
  //   .catch(err => res.status(400).json(err));
  //   //res.status(500).json({ error: 'not implemented' });

  // });
  

  return authController;
};
