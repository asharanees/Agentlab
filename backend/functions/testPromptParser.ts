import { handler } from "./promptParser";

const testPrompts = [
  {
    input: "Check my calendar every morning. If I’m booked solid, Slack me a reminder.",
    expected: {
      trigger: "daily at 8AM",
      action: "check calendar for availability",
      condition: "if booked solid",
      response: "send Slack reminder"
    }
  },
  {
    input: "Alert me if my expenses spike on my DynamoDB table.",
    expected: {
      trigger: "continuous monitoring",
      action: "query DynamoDB expenses",
      condition: "if spike detected",
      response: "send alert"
    }
  },
  {
    input: "Every Friday, summarize open GitHub issues and email me a digest.",
    expected: {
      trigger: "weekly on Friday",
      action: "summarize GitHub issues",
      response: "email digest"
    }
  }
];

(async () => {
  for (const { input, expected } of testPrompts) {
    const event = { body: JSON.stringify({ prompt: input }) };
    const result = await handler(event as any, {} as any, () => null);
    const blueprint = JSON.parse(result.body).blueprint;

    console.log("🧪 Testing Prompt:", input);
    console.log("➡️ Parsed:", blueprint);
    console.log("✅ Expected:", expected);
    console.log("---");
  }
})();