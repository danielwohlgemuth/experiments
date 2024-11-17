// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require("uuid/v4");
const sendMessage = require("./sendMessage");

const createGame = async ({ creator, opponent }) => {
  let params = {};
  try {
    const secondsInDay = 24 * 60 * 60;
    params = {
      TableName: "turn-based-game",
      Item: {
        gameId: uuidv4().split('-')[0],
        user1: creator,
        user2: opponent.username,
        heap1: 5,
        heap2: 4,
        heap3: 5,
        lastMoveBy: creator,
        lastModifiedAt: Date.now(),
        expireAt: Math.floor(Date.now() / 1000 + 7 * secondsInDay),
      }
    };
    await documentClient.put(params).promise();
  } catch (error) {
    console.error("Error creating game: ", error);
    throw new Error("Could not create game");
  }

  try {
    const message = `Hi ${opponent.username}. Your friend ${creator} has invited you to a new game! Your game ID is ${params?.Item?.gameId}`;
    await sendMessage({ phoneNumber: opponent.phoneNumber, message });

    return { game: params.Item };
  } catch (error) {
    console.error("Error sending message: ", error);
    throw new Error("Could not send message to user");
  }
};

module.exports = createGame;
