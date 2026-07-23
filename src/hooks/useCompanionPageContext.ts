import { useEffect } from "react";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";

// Pages call this to expose their current row IDs / state to the companion,
// e.g. useCompanionPageContext({ essayId }) on EditEssay. The values are
// serialized into the next companion request's page_context.params.
//
// Safe to call on any page — if the provider isn't mounted (e.g. counselor
// route sharing a component), this is a no-op.
export function useCompanionPageContext(extras: Record<string, unknown> | null | undefined) {
  const { publishPageContext } = useCompanionSession();

  // Stable dep: stringify (extras are small primitive objects)
  const key = extras ? JSON.stringify(extras) : "";

  useEffect(() => {
    publishPageContext(extras ?? null);
    return () => publishPageContext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, publishPageContext]);
}
