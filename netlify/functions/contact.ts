import type { Handler } from "@netlify/functions";
import { sendContactEmail } from "../../lib/contact-email";

function json(statusCode: number, message: string) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        Allow: "POST, OPTIONS"
      }
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, "Method not allowed.");
  }

  if (!event.body) {
    return json(400, "Missing request body.");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(event.body);
  } catch {
    return json(400, "Invalid JSON payload.");
  }

  const result = await sendContactEmail(payload as Record<string, unknown>);
  return json(result.statusCode, result.message);
};
