import { getSession } from "./actions"
import WebhookSetupClientPage from "./WebhookSetupClientPage"

async function Page() {
  const session = await getSession()

  return <WebhookSetupClientPage session={session} />
}

export const metadata = {
  title: "Coinbase Webhook Setup",
}

export default Page
