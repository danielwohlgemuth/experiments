// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const fetchGames = async username => {
  try {
    const params1 = {
      TableName: "turn-based-game",
      IndexName: "gsi-user1",
      KeyConditionExpression: "user1 = :username",
      FilterExpression: "expireAt > :expireAt",
      ExpressionAttributeValues: {
        ":username": username,
        ":expireAt": Date.now() / 1000,
      },
    };
    const params2 = {
      TableName: "turn-based-game",
      IndexName: "gsi-user2",
      KeyConditionExpression: "user2 = :username",
      FilterExpression: "expireAt > :expireAt",
      ExpressionAttributeValues: {
        ":username": username,
        ":expireAt": Date.now() / 1000,
      },
    };

    const games1 = await documentClient.query(params1).promise();
    const games2 = await documentClient.query(params2).promise();
    const sortedGames = [
      ...games1.Items,
      ...games2.Items,
    ].sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);
    return { games: sortedGames };
  } catch (error) {
    console.error("Error fetching games: ", error);
    throw new Error("Could not fetch games");
  }
};

module.exports = fetchGames;
