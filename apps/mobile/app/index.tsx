import { Redirect } from "expo-router";

/** App entry — always land on `/home` splash first. */
export default function Index() {
  return <Redirect href="/home" />;
}
