import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/integrations")({
  component: () => (
    <>
      <PageHeader
        title="Integrations"
        description="Tenant-owned channels, payment gateway, and external systems."
      />
      <Placeholder
        scope="Level B"
        title="Tenant integrations — Level B only"
        notes={[
          "Messaging channels (WhatsApp, web chat, SMS), POS, the tenant's own payment gateway.",
          "Tenant payment gateway is the tenant's account — never the platform's.",
        ]}
        contract="Sensitive integration credentials are stored and validated by the backend."
      />
    </>
  ),
});
