import { CreatePasswordPage } from "../create-password-page";

type CreatePasswordTokenRouteProps = {
  params: Promise<{ token: string }>;
};

/** Invite links use `/create-password/<token>` so email/middleware cannot drop the token. */
export default async function CreatePasswordTokenRoutePage({
  params,
}: CreatePasswordTokenRouteProps) {
  const { token: rawToken } = await params;
  let token = "";
  try {
    token = decodeURIComponent(rawToken).trim();
  } catch {
    token = rawToken.trim();
  }
  return <CreatePasswordPage initialToken={token} />;
}
