import { APIGatewayProxyResult } from 'aws-lambda';

export function buildResponse<T>(statusCode: number, body: T) {
    const response: APIGatewayProxyResult = {
        statusCode: statusCode, 
        headers: { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify(body)
    }

    return response;
}

export function buildErrorResponse(statusCode: number, message: string) {
    const response: APIGatewayProxyResult = {
        statusCode: statusCode, 
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({"error": message})
    }

    return response;
}

