import { memo, useCallback } from "react";
import { CircleCheck as CheckCircle2, Circle } from "lucide-react";
import { useHalo } from "../../../state/HaloStateContext";

export default memo(function TasksWidget() {
  const { state, dispatch } = useHalo();
  const pending = state.tasks.filter((t) => !t.done).slice(0, 5);

  const toggle = useCallback((id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    if (task) dispatch({ type: "UPSERT_TASK", payload: { ...task, done: !task.done } });
  }, [state.tasks, dispatch]);

  return (
    <div className="widget-tasks">
      <div className="widget-section-title">Tasks</div>
      {pending.length === 0 ? (
        <div className="widget-empty">No pending tasks</div>
      ) : (
        <ul className="widget-tasks__list">
          {pending.map((t) => (
            <li key={t.id} className="widget-tasks__item">
              <button className="widget-tasks__check" onClick={() => toggle(t.id)}>
                {t.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
              </button>
              <span className={`widget-tasks__title${t.done ? " widget-tasks__title--done" : ""}`}>{t.title}</span>
              <span className={`widget-tasks__priority widget-tasks__priority--${t.priority}`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
