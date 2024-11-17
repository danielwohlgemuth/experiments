// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const sns = new AWS.SNS();

const sendMessage = async ({ phoneNumber, message }) => {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber
  };

  if (process.env.SEND_SMS === '1') {
    return sns.publish(params).promise();
  }
  return Promise.resolve(undefined);
};

module.exports = sendMessage;
