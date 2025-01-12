import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import Redis from 'ioredis';


const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
    host: redisHost,
    port: redisPort,
});

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
    let connections;
    try {
        connections = await redis.keys('*');
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

    const sendMessages = connections.map(async (connectionId) => {
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