import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const command = new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
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