import React, { memo, useCallback, useState } from "react";
import { GripVertical, X, EyeOff } from "lucide-react";
import type { WidgetId } from "../../types/halo";
import { WidgetRenderer } from "./WidgetRegistry";

interface Props {
  id: WidgetId;
  index: number;
  total: number;
  onMoveUp: (id: WidgetId) => void;
  onMoveDown: (id: WidgetId) => void;
  onHide: (id: WidgetId) => void;
  editMode: boolean;
}

export const WidgetFrame = memo(function WidgetFrame({ id, index, total, onMoveUp, onMoveDown, onHide, editMode }: Props) {
  const [hovered, setHovered] = useState(false);
  const handleMoveUp = useCallback(() => onMoveUp(id), [id, onMoveUp]);
  const handleMoveDown = useCallback(() => onMoveDown(id), [id, onMoveDown]);
  const handleHide = useCallback(() => onHide(id), [id, onHide]);

  return (
    <div className={`widget-frame${editMode ? " widget-frame--edit" : ""}${hovered && editMode ? " widget-frame--hovered" : ""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {editMode && (
        <div className="widget-controls">
          <div className="widget-drag-handle"><GripVertical size={14} /></div>
          <div className="widget-control-btns">
            {index > 0 && <button className="widget-btn" onClick={handleMoveUp} title="Move up">↑</button>}
            {index < total - 1 && <button className="widget-btn" onClick={handleMoveDown} title="Move down">↓</button>}
            <button className="widget-btn widget-btn--danger" onClick={handleHide} title="Hide"><EyeOff size={12} /></button>
          </div>
        </div>
      )}
      <WidgetRenderer id={id} />
    </div>
  );
});
