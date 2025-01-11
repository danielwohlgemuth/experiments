import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            connectionId: event.requestContext.connectionId,
        },
    });

    try {
        await docClient.send(command)
    } catch (err) {
        console.log(err)
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