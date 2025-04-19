import { SetupUser } from "@/lib/actions/billing.action";

async function SetupPage() {
  return await SetupUser();
}

export default SetupPage;
