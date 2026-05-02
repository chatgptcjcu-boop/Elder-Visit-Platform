"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { DataGovernanceMatrix } from "@/components/workspace/data-governance-matrix";
import {
  capabilityLabels,
  workspaceMembers,
  workspaceRoles,
} from "@/lib/domain/permissions";
import type { Capability, WorkspaceMember, WorkspaceRole } from "@/lib/domain/types";

export function PermissionsPanel() {
  const [selectedRoleKey, setSelectedRoleKey] = useState(workspaceRoles[0].key);
  const [roles, setRoles] = useState<WorkspaceRole[]>(workspaceRoles);
  const [members, setMembers] = useState<WorkspaceMember[]>(workspaceMembers);
  const selectedRole = roles.find((role) => role.key === selectedRoleKey) ?? roles[0];
  const allCapabilities = Object.keys(capabilityLabels) as Capability[];

  useEffect(() => {
    async function loadPermissions() {
      const response = await fetch("/api/permissions");
      const result = (await response.json()) as {
        data?: { roles: WorkspaceRole[]; members: WorkspaceMember[] };
      };
      setRoles(result.data?.roles ?? workspaceRoles);
      setMembers(result.data?.members ?? workspaceMembers);
    }

    void loadPermissions();
  }, []);

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">權限管理</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          依角色控管選單、稽核核准、核銷鎖定、匯出與工作空間設定。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">成員角色</h2>
          </div>
          <div className="mt-4 space-y-3">
            {members.map((member) => {
              const role = roles.find((item) => item.key === member.roleKey);
              return (
                <button
                  key={member.id}
                  type="button"
                  className="w-full rounded-md border bg-background p-3 text-left transition-colors hover:bg-secondary"
                  onClick={() => setSelectedRoleKey(member.roleKey)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{member.fullName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {role?.label ?? member.roleKey}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h2 className="font-semibold">角色權限矩陣</h2>
          <label className="mt-4 block text-sm font-medium">
            檢視角色
            <select
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={selectedRoleKey}
              onChange={(event) => setSelectedRoleKey(event.target.value as WorkspaceRole["key"])}
            >
              {roles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{selectedRole.label}</p>
            <p className="mt-1">{selectedRole.description}</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {allCapabilities.map((capability) => {
              const enabled = selectedRole.capabilities.includes(capability);
              return (
                <div
                  key={capability}
                  className={`rounded-md border p-3 text-sm ${
                    enabled ? "border-primary/30 bg-primary/5" : "bg-background text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{capabilityLabels[capability]}</span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                      {enabled ? "允許" : "禁止"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{capability}</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <DataGovernanceMatrix roles={roles} />
    </div>
  );
}
