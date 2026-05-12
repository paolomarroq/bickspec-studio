import { useTheme } from "../../theme/ThemeProvider";

const logoLightUrl = new URL("../../../assets/brand/logo_transparent.png", import.meta.url).href;
const logoDarkUrl = new URL("../../../assets/brand/logo_dark_transparent.png", import.meta.url).href;
const iconUrl = new URL("../../../assets/brand/icon.png", import.meta.url).href;

export function BrandLogo({ variant = "wordmark", className = "" }: { variant?: "wordmark" | "icon"; className?: string }) {
  const { theme } = useTheme();
  const src = variant === "icon" ? iconUrl : theme === "dark" ? logoDarkUrl : logoLightUrl;
  const alt = variant === "icon" ? "BickSpec icon" : "BickSpec";

  return <img className={className} src={src} alt={alt} draggable={false} />;
}

