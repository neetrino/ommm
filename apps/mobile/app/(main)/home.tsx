import { SplashScreen } from "../../src/features/splash/screens/SplashScreen";

/** Public entry at `/home` — branded splash, then Login (or role home when signed in). */
export default function PublicHomeRoute() {
  return <SplashScreen />;
}
