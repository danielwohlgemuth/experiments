import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const ddbcommand = new ScanCommand({
        TableName: process.env.TABLE_NAME
    })

    let connections;
    try {
        connections = await docClient.send(ddbcommand);
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: '500 Internal Server Error',
        };
    }

    const callbackAPI = new ApiGatewayManagementApiClient({
        apiVersion: '2018-11-29',
        endpoint: 'https://' + event.requestContext.domainName + '/' + event.requestContext.stage,
    });

    const message = JSON.parse(event.body ?? '{}').message;

    const sendMessages = connections.Items.map(async ({ connectionId }) => {
        if (connectionId !== event.requestContext.connectionId) {
            try {
                await callbackAPI.send(new PostToConnectionCommand(
                    { ConnectionId: connectionId, Data: message, }
                ));
            } catch (e) {
                console.log(e);
            }
        }
    });

    try {
        await Promise.all(sendMessages)
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: '500 Internal Server Error',
        };
    }

    return {
        statusCode: 200,
        body: 'OK',
    };
};