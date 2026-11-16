import type { ReactNode } from "react";
import AuthForm from "./AuthForm";
import { useSession } from "./auth";
import { ErrorState, Loading } from "./components";

/** Own the signed-out boundary so auth/profile updates cannot reset its draft. */
export default function AccountGate({
  children,
  initialJoin,
  onComplete,
  authDialogOpen = false,
}: {
  children: ReactNode;
  initialJoin: boolean;
  onComplete: () => void;
  authDialogOpen?: boolean;
}) {
  const session = useSession();
  if (!session.user)
    return authDialogOpen ? null : (
      <AuthForm initialJoin={initialJoin} onComplete={onComplete} />
    );
  if (session.loading) return <Loading layout="profile" label="Opening your Flixie account…" />;
  if (session.error)
    return (
      <ErrorState
        message={session.error}
        retry={() => void session.reloadProfile().catch(() => {})}
      />
    );
  return children;
}
