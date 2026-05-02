"use client";

import { useMemo, useState } from "react";
import { DatabaseZap, ShieldCheck } from "lucide-react";
import {
  featureDataGovernance,
  governanceOperationLabels,
  type GovernanceOperation,
} from "@/lib/domain/data-governance";
import { capabilityLabels } from "@/lib/domain/permissions";
import type { Capability, WorkspaceRole } from "@/lib/domain/types";

const operations: GovernanceOperation[] = ["read", "create", "update", "delete", "approve", "export"];

export function DataGovernanceMatrix({ roles }: { roles: WorkspaceRole[] }) {
  const [selectedRoleKey, setSelectedRoleKey] = useState(roles[0]?.key ?? "workspace_manager");
  const selectedRole = roles.find((role) => role.key === selectedRoleKey) ?? roles[0];
  const groupedRows = useMemo(
    () =>
      featureDataGovernance.reduce<Record<string, typeof featureDataGovernance>>((groups, item) => {
        groups[item.group] = [...(groups[item.group] ?? []), item];
        return groups;
      }, {}),
    [],
  );

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">資料欄位與 CRUD 權限盤點</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            依每個功能盤點可新增、修改、刪除、審核與匯出的欄位範圍。
          </p>
        </div>
        <label className="text-sm font-medium lg:w-72">
          檢視角色可執行操作
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
      </div>

      <div className="mt-4 grid gap-4">
        {Object.entries(groupedRows).map(([group, rows]) => (
          <div key={group} className="rounded-lg border bg-background">
            <div className="border-b px-3 py-2">
              <h3 className="text-sm font-semibold">{group}</h3>
            </div>
            <div className="divide-y">
              {rows.map((row) => (
                <article key={row.key} className="grid gap-3 p-3 xl:grid-cols-[0.8fr_1.1fr_1fr]">
                  <div>
                    <p className="font-semibold">{row.feature}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{row.dataScope}</p>
                    <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {row.governanceNote}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <FieldList title="可新增 / 修改欄位" values={row.editableFields} />
                    <FieldList title="限制欄位" values={row.restrictedFields} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {operations.map((operation) => {
                      const requiredCapabilities = row.operations[operation] ?? [];
                      const enabled = canOperate(selectedRole?.capabilities ?? [], requiredCapabilities);
                      const hasOperation = requiredCapabilities.length > 0;

                      return (
                        <div
                          key={operation}
                          className={`rounded-md border p-2 text-xs ${
                            enabled
                              ? "border-primary/30 bg-primary/5 text-primary"
                              : hasOperation
                                ? "bg-card text-muted-foreground"
                                : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{governanceOperationLabels[operation]}</span>
                            <span>{enabled ? "允許" : hasOperation ? "禁止" : "不適用"}</span>
                          </div>
                          {hasOperation && (
                            <p className="mt-1 leading-5">
                              {requiredCapabilities.map((capability) => capabilityLabels[capability]).join("、")}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FieldList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 leading-6">{values.join("、")}</p>
    </div>
  );
}

function canOperate(roleCapabilities: Capability[], requiredCapabilities: Capability[]) {
  if (requiredCapabilities.length === 0) {
    return false;
  }
  return requiredCapabilities.some((capability) => roleCapabilities.includes(capability));
}
