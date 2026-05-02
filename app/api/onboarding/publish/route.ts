import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { aiConfidence, blueprints, currentAccount, workspaces } from "@/lib/domain/mock-data";
import type { OnboardingDraft } from "@/lib/domain/onboarding";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "onboarding.publish");
  if (forbidden) return forbidden;

  const draft = (await request.json()) as OnboardingDraft;
  const blueprint = blueprints.find((item) => item.type === "elder_visit");
  const workspace = workspaces.find((item) => item.type === "elder_visit");

  return NextResponse.json({
    data: {
      account: {
        ...currentAccount,
        email: draft.account.email,
        fullName: draft.account.fullName,
      },
      unit: draft.unit,
      workspace: {
        ...workspace,
        name: draft.workspace.workspaceName,
        responsiblePerson: draft.workspace.responsiblePerson,
      },
      blueprintBinding: {
        blueprintId: draft.workspace.blueprintId,
        blueprintVersion: blueprint?.version,
        bindingStatus: "locked",
      },
      aiConfidence,
      createdResources: [
        "workspace_settings",
        "workspace_memberships",
        "workspace_blueprint_binding",
        "effective_permissions",
        "default_form_templates",
        "default_workflow_templates",
      ],
    },
  });
}
