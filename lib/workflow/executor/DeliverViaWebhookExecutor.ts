import { ExecutionEnvironment } from "@/types/executor";
import { DeliverViaWebhookTask } from "../task/DeliverViaWebhook";

export async function DeliverViaWebhookExecutor(
  environment: ExecutionEnvironment<typeof DeliverViaWebhookTask>
): Promise<boolean> {
  try {
    const targetUrl = environment.getInput("Target URL");

    if (!targetUrl) {
      environment.log.error("input->targetUrl is not defined");
      return false;
    }

    const body = environment.getInput("Body");

    if (!body) {
      environment.log.error("input->body is not defined");
      return false;
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const statusCode = response.status;

    if (statusCode !== 200) {
      environment.log.error(`Webhook returned status code ${statusCode}`);
      return false;
    }

    const responseBody = await response.json();
    environment.log.info(`Webhook delivered with response: ${JSON.stringify(responseBody, null, 4)}`);

    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
