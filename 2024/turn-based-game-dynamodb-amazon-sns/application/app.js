// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  createGame,
  fetchGame,
  fetchGames,
  performMove,
  handlePostMoveNotification
} = require("./data");
const {
  createCognitoUser,
  login,
  fetchUserByUsername,
  verifyToken
} = require("./auth");
const {
  validateCreateUser,
  validateCreateGame,
  validatePerformMove
} = require("./validate");

const app = express();
app.use(bodyParser.json());
app.use(cors());

function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Login
app.post("/login", wrapAsync(async (req, res) => {
  const idToken = await login(req.body.username, req.body.password);
  res.json({ idToken });
}));

// Create user
app.post("/users", wrapAsync(async (req, res) => {
  const validated = validateCreateUser(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }
  const user = await createCognitoUser(
    req.body.username,
    req.body.password,
    req.body.email,
    req.body.phoneNumber
  );
  res.json(user);
}));

// Create new game
app.post("/games", wrapAsync(async (req, res) => {
  const validated = validateCreateGame(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }
  const token = await verifyToken(req.header("Authorization"));
  const opponent = await fetchUserByUsername(req.body.opponent);
  const game = await createGame({
    creator: token["cognito:username"],
    opponent: opponent
  });
  res.json(game);
}));

// Fetch game
app.get("/games/:gameId", wrapAsync(async (req, res) => {
  const game = await fetchGame(req.params.gameId);
  res.json(game);
}));

// Fetch games
app.get("/games", wrapAsync(async (req, res) => {
  const token = await verifyToken(req.header("Authorization"));
  const games = await fetchGames(token["cognito:username"]);
  res.json(games);
}));

// Perform move
app.post("/games/:gameId", wrapAsync(async (req, res) => {
  const validated = validatePerformMove(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }

  const token = await verifyToken(req.header("Authorization"));
  const user = token["cognito:username"];
  const { game } = await performMove({
    gameId: req.params.gameId,
    user: user,
    changedHeap: req.body.changedHeap,
    changedHeapValue: req.body.changedHeapValue
  });
  const opponentUsername = game.user1 === user ? game.user2 : game.user1;
  const opponent = await fetchUserByUsername(opponentUsername);
  const mover = {
    username: user,
    phoneNumber: token['phone_number']
  }
  await handlePostMoveNotification({ game, mover, opponent })
  res.json({ game });
}));

app.use(function(error, req, res, next) {
  res.status(400).json({ message: error.message });
});

module.exports = app;
