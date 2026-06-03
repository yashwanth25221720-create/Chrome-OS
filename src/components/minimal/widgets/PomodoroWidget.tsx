import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { useHalo } from "../../../state/HaloStateContext";

type Phase = "work" | "break";

export default memo(function PomodoroWidget() {
  const { state, dispatch } = useHalo();
  const { workMinutes, breakMinutes } = state.pomodoroSettings;
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [wm, setWm] = useState(String(workMinutes));
  const [bm, setBm] = useState(String(breakMinutes));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const totalSeconds = (phase === "work" ? workMinutes : breakMinutes) * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const tick = useCallback(() => {
    setSecondsLeft((s) => {
      if (s <= 1) {
        setRunning(false);
        const next: Phase = phaseRef.current === "work" ? "break" : "work";
        setPhase(next);
        return (next === "work" ? workMinutes : breakMinutes) * 60;
      }
      return s - 1;
    });
  }, [workMinutes, breakMinutes]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  function reset() { setRunning(false); setPhase("work"); setSecondsLeft(workMinutes * 60); }
  function saveConfig() {
    const w = Math.max(1, Math.min(60, parseInt(wm) || workMinutes));
    const b = Math.max(1, Math.min(30, parseInt(bm) || breakMinutes));
    dispatch({ type: "SET_POMODORO", payload: { workMinutes: w, breakMinutes: b } });
    setSecondsLeft(w * 60);
    setRunning(false);
    setPhase("work");
    setConfigOpen(false);
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="widget-pomodoro">
      <div className="widget-section-title">Pomodoro<button className="widget-icon-btn" onClick={() => setConfigOpen(!configOpen)}><Settings size={13} /></button></div>
      {configOpen ? (
        <div className="widget-pomodoro__config">
          <label>Work (min)<input className="widget-input widget-input--sm" type="number" value={wm} onChange={(e) => setWm(e.target.value)} min="1" max="60" /></label>
          <label>Break (min)<input className="widget-input widget-input--sm" type="number" value={bm} onChange={(e) => setBm(e.target.value)} min="1" max="30" /></label>
          <div className="widget-quicklinks__form-btns">
            <button className="widget-btn-primary" onClick={saveConfig}>Save</button>
            <button className="widget-btn-ghost" onClick={() => setConfigOpen(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="widget-pomodoro__timer">
          <div className="widget-pomodoro__ring-wrap">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
              <circle cx="44" cy="44" r="36" fill="none" stroke={phase === "work" ? "var(--color-accent)" : "var(--color-success)"} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="widget-pomodoro__ring-text">
              <span className="widget-pomodoro__time">{mins}:{secs}</span>
              <span className="widget-pomodoro__phase">{phase}</span>
            </div>
          </div>
          <div className="widget-pomodoro__controls">
            <button className="widget-icon-btn" onClick={reset} title="Reset"><RotateCcw size={15} /></button>
            <button className="widget-btn-primary widget-btn-primary--sm" onClick={() => setRunning(!running)}>
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? "Pause" : "Start"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
