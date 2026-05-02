"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Capability } from "@/lib/domain/types";

const PermissionContext = createContext<Capability[]>([]);

export function PermissionProvider({
  capabilities,
  children,
}: {
  capabilities: Capability[];
  children: ReactNode;
}) {
  return (
    <PermissionContext.Provider value={capabilities}>
      {children}
    </PermissionContext.Provider>
  );
}

export function useCan(capability: Capability) {
  const capabilities = useContext(PermissionContext);
  return capabilities.includes(capability);
}

export function useCanAny(requiredCapabilities: Capability[]) {
  const capabilities = useContext(PermissionContext);
  return requiredCapabilities.some((capability) => capabilities.includes(capability));
}
