// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const performMove = async ({ gameId, user, changedHeap, changedHeapValue }) => {
  try {
    if (changedHeapValue < 0) {
      throw new Error("Cannot set heap value below 0");
    }

    const secondsInDay = 24 * 60 * 60;
    const params = {
      TableName: "turn-based-game",
      Key: {
        gameId: gameId
      },
      UpdateExpression: `SET lastMoveBy = :user, ${changedHeap} = :changedHeapValue, lastModifiedAt = :lastModifiedAt, expireAt = :expireAt`,
      ConditionExpression: `(user1 = :user OR user2 = :user) AND lastMoveBy <> :user AND ${changedHeap} > :changedHeapValue`,
      ExpressionAttributeValues: {
        ":user": user,
        ":changedHeapValue": changedHeapValue,
        ":lastModifiedAt": Date.now(),
        ":expireAt": Math.floor(Date.now() / 1000 + 7 * secondsInDay),
      },
      ReturnValues: "ALL_NEW"
    };

    const resp = await documentClient.update(params).promise();
    return { game: resp.Attributes };
  } catch (error) {
    console.error("Error updating item: ", error);
    throw new Error('Could not perform move')
  }
};

module.exports = performMove