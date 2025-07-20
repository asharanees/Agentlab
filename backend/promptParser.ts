

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { APIGatewayProxyHandler } from "aws-lambda";
import * as dotenv from "dotenv";
dotenv.config();



const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-v2";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler: APIGatewayProxyHandler = async (event) => {
  let prompt: string | undefined;
  try {
    const body = JSON.parse(event.body || '{}');
    prompt = body.prompt;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body." })
    };
  }

  if (!prompt || typeof prompt !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid 'prompt' in request body." })
    };
  }

  const systemMessage = `You are an agent parser. Convert the user's prompt into a structured agent blueprint.`;
  const userMessage = `User prompt: "${prompt}"`;

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ]
    })
  });

  try {
    const response = await client.send(command);
    let parsed;
    try {
      const decoded = response.body ? new TextDecoder().decode(response.body) : "";
      parsed = JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to decode or parse response:", e);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Invalid response from model." })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ blueprint: parsed })
    };
  } catch (error) {
    console.error("Prompt parsing error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to parse prompt." })
    };
  }
};


export interface AgentBlueprint {
  trigger: string;
  action: string;
  condition?: string;
  response: string;
}

