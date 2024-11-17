// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const fetchGame = async gameId => {
  try {
    const params = {
      TableName: "turn-based-game",
      Key: {
        gameId: gameId
      }
    };

    const game = await documentClient.get(params).promise();
    return { game: game.Item };
  } catch (error) {
    console.error("Error fetching game: ", error);
    throw new Error("Could not fetch game");
  }
};

module.exports = fetchGame;
