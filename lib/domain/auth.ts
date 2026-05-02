import { currentAccount, workspaces } from "@/lib/domain/mock-data";
import { demoLoginAccounts, getRoleByKey } from "@/lib/domain/permissions";
import type { DemoLoginAccount, WorkspaceRoleKey } from "@/lib/domain/types";

export type SessionState = {
  account: typeof currentAccount | null;
  demoAccount: DemoLoginAccount;
  roleKey: WorkspaceRoleKey;
  roleLabel: string;
  onboardingCompleted: boolean;
  workspaceCount: number;
  nextPath: string;
};

export function getMockSessionState(roleKey: WorkspaceRoleKey = "workspace_manager"): SessionState {
  const demoAccount =
    demoLoginAccounts.find((account) => account.roleKey === roleKey) ?? demoLoginAccounts[1];
  const role = getRoleByKey(demoAccount.roleKey);

  return {
    account: {
      ...currentAccount,
      email: demoAccount.email,
      fullName: demoAccount.fullName,
    },
    demoAccount,
    roleKey: demoAccount.roleKey,
    roleLabel: role.label,
    onboardingCompleted: true,
    workspaceCount: workspaces.length,
    nextPath: demoAccount.landingPath,
  };
}
