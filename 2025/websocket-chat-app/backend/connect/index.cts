import { APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import Redis from 'ioredis';


const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
    host: redisHost,
    port: redisPort,
});

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
    try {
        await redis.set(event.requestContext.connectionId, '');
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