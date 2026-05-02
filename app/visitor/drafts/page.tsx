import { AppShell } from "@/components/layout/app-shell";
import { DraftList } from "@/components/visitor/draft-list";

export default function VisitorDraftsPage() {
  return (
    <AppShell active="drafts">
      <DraftList />
    </AppShell>
  );
}
