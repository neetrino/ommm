import { decodeTokenSegment } from "@/lib/auth-token-param";
import { CreatePasswordPage } from "../create-password-page";

type CreatePasswordTokenRouteProps = {
  params: Promise<{ token: string }>;
};

/** Invite links use `/create-password/<token>` so email/middleware cannot drop the token. */
export default async function CreatePasswordTokenRoutePage({
  params,
}: CreatePasswordTokenRouteProps) {
  const { token } = await params;
  return <CreatePasswordPage initialToken={decodeTokenSegment(token)} />;
}
