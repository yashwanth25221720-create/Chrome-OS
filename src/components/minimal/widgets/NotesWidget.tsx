import { memo } from "react";
import { useHalo } from "../../../state/HaloStateContext";

export default memo(function NotesWidget() {
  const { state } = useHalo();
  const recent = state.notes.slice(0, 3);
  return (
    <div className="widget-notes">
      <div className="widget-section-title">Recent Notes</div>
      {recent.length === 0 ? (
        <div className="widget-empty">No notes yet</div>
      ) : (
        <ul className="widget-notes__list">
          {recent.map((n) => (
            <li key={n.id} className="widget-notes__item">
              <span className="widget-notes__title">{n.title}</span>
              <span className="widget-notes__preview">{n.content.slice(0, 50)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
