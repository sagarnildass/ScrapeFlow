import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import { prisma } from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";

export async function ExtractDataWithAiExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
  try {
    const credentials = environment.getInput("Credentials");

    if (!credentials) {
      environment.log.error("input->credentials is not defined");
      return false;
    }

    const prompt = environment.getInput("Prompt");

    if (!prompt) {
      environment.log.error("input->prompt is not defined");
      return false;
    }

    const content = environment.getInput("Content");

    if (!content) {
      environment.log.error("input->content is not defined");
      return false;
    }

    // Get Credentials from database
    const credential = await prisma.credential.findUnique({
      where: {
        id: credentials,
      },
    });

    if (!credential) {
      environment.log.error("credentials not found");
      return false;
    }

    const plainCredentialValue = symmetricDecrypt(credential.value);

    if (!plainCredentialValue) {
      environment.log.error("cannot decrypt credential");
      return false;
    }
    
    const mockExtractedData = {
        usernameSelector: "#username",
        passwordSelector: "#password",
        loginSelector: "body > div > form > input.btn.btn-primary",
    }

    environment.setOutput("Extracted data", JSON.stringify(mockExtractedData));
    console.log("@@PLAIN CREDENTIAL VALUE", plainCredentialValue);

    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
