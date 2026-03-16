import { generateMockData } from "./mockData.mjs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: "",
      };
    }

    const data = generateMockData();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
