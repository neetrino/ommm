import { decodeTokenSegment } from "@/lib/auth-token-param";
import { ResetPasswordPage } from "../reset-password-page";

type ResetPasswordTokenRouteProps = {
  params: Promise<{ token: string }>;
};

/** Reset links use `/reset-password/<token>` so email clients cannot drop the token. */
export default async function ResetPasswordTokenRoutePage({
  params,
}: ResetPasswordTokenRouteProps) {
  const { token } = await params;
  return <ResetPasswordPage initialToken={decodeTokenSegment(token)} />;
}
