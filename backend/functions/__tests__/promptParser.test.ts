import { handler } from '../promptParser';

interface AgentBlueprint {
  trigger: string;
  action: string;
  condition?: string;
  response: string;
}

const testPrompts: { input: string; expected: Partial<AgentBlueprint> }[] = [
  {
    input: "Check my calendar every morning. If I’m booked solid, Slack me a reminder.",
    expected: {
      trigger: "daily",
      action: "check calendar",
      response: "send Slack reminder"
    }
  },
  {
    input: "Alert me if my expenses spike on my DynamoDB table.",
    expected: {
      action: "query DynamoDB",
      condition: "if expenses spike",
      response: "send alert"
    }
  },
  {
    input: "Summarize open GitHub issues every Friday and email me.",
    expected: {
      trigger: "weekly",
      action: "summarize GitHub issues",
      response: "email me"
    }
  }
];

describe("Agent Prompt Parsing", () => {
  testPrompts.forEach(({ input, expected }) => {
    test(`Parses: "${input}"`, async () => {
      const event = { body: JSON.stringify({ prompt: input }) };
      const result = await handler(event as any, {} as any, () => null);
      const blueprint = JSON.parse(result.body).blueprint as AgentBlueprint;

      for (const key in expected) {
        expect(blueprint[key as keyof AgentBlueprint])
          .toMatch(new RegExp(expected[key as keyof AgentBlueprint]!, "i"));
      }
    });
  });
});