import { memo, useCallback, useState } from "react";
import { Settings } from "lucide-react";
import type { WidgetId } from "../../types/halo";
import { useHalo } from "../../state/HaloStateContext";
import { WidgetFrame } from "./WidgetFrame";
import { WallpaperLayer } from "./WallpaperLayer";

export const MinimalDesktop = memo(function MinimalDesktop() {
  const { state, dispatch } = useHalo();
  const [editMode, setEditMode] = useState(false);

  const visibleWidgets = state.widgets.filter((w: { visible: boolean }) => w.visible).sort((a: { order: number }, b: { order: number }) => a.order - b.order);

  const moveWidget = useCallback(
    (id: WidgetId, direction: "up" | "down") => {
      const idx = visibleWidgets.findIndex((w) => w.id === id);
      if ((direction === "up" && idx <= 0) || (direction === "down" && idx >= visibleWidgets.length - 1)) return;

      const swapWith = visibleWidgets[direction === "up" ? idx - 1 : idx + 1];
      const sorted = state.widgets.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      const aIdx = sorted.findIndex((w: { id: WidgetId }) => w.id === id);
      const bIdx = sorted.findIndex((w: { id: WidgetId }) => w.id === swapWith.id);
      [sorted[aIdx], sorted[bIdx]] = [sorted[bIdx], sorted[aIdx]];

      dispatch({ type: "SET_WIDGETS", payload: sorted.map((w: { id: WidgetId; visible: boolean; order: number }, i: number) => ({ ...w, order: i })) });
    },
    [state.widgets, visibleWidgets, dispatch],
  );

  const hideWidget = useCallback(
    (id: WidgetId) => {
      const updated = state.widgets.map((w: { id: WidgetId; visible: boolean; order: number }) => (w.id === id ? { ...w, visible: false } : w));
      dispatch({ type: "SET_WIDGETS", payload: updated });
    },
    [state.widgets, dispatch],
  );

  return (
    <div className={`minimal-desktop${editMode ? " minimal-desktop--edit" : ""}`}>
      <WallpaperLayer wallpaper={state.wallpaper} />
      <div className="minimal-desktop__container">
        <button
          className={`minimal-desktop__edit-btn${editMode ? " minimal-desktop__edit-btn--active" : ""}`}
          onClick={() => setEditMode(!editMode)}
          title={editMode ? "Done editing" : "Edit widgets"}
        >
          <Settings size={16} />
        </button>
        <div className="minimal-desktop__widgets">
          {visibleWidgets.map((w: { id: WidgetId }, i: number) => (
            <WidgetFrame
              key={w.id}
              id={w.id}
              index={i}
              total={visibleWidgets.length}
              onMoveUp={() => moveWidget(w.id, "up")}
              onMoveDown={() => moveWidget(w.id, "down")}
              onHide={hideWidget}
              editMode={editMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
