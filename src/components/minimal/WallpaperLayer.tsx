import { memo } from "react";

interface Props { wallpaper: string; }
export const WallpaperLayer = memo(function WallpaperLayer({ wallpaper }: Props) {
  if (!wallpaper) return null;
  return <div className="wallpaper-layer" style={{ backgroundImage: `url(${wallpaper})` }} />;
});
