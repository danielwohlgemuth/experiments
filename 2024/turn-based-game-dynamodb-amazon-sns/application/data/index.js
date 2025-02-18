// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const createGame = require("./createGame");
const fetchGame = require("./fetchGame");
const fetchGames = require("./fetchGames");
const performMove = require("./performMove");
const handlePostMoveNotification = require('./handlePostMoveNotification')

module.exports = {
  createGame,
  fetchGame,
  fetchGames,
  performMove,
  handlePostMoveNotification
};
