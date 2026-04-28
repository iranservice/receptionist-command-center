import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "./nav-config";

type WorkspaceCtx = {
  role: Role;
  setRole: (r: Role) => void;
};

const Ctx = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children, defaultRole = "business_admin" }: { children: ReactNode; defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole);
  const value = useMemo(() => ({ role, setRole }), [role]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
