import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { HaloState, ViewKey, Note, Task, Widget, WeatherData } from "../types/halo";
import { defaultState } from "../storage/defaultState";
import { loadState, saveState } from "../storage/chromeStorage";

type Action =
  | { type: "INIT"; payload: HaloState }
  | { type: "SET_VIEW"; payload: ViewKey }
  | { type: "UPSERT_NOTE"; payload: Note }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "UPSERT_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "SET_WIDGETS"; payload: Widget[] }
  | { type: "SET_WEATHER"; payload: WeatherData }
  | { type: "SET_WEATHER_CITY"; payload: string }
  | { type: "SET_POMODORO"; payload: { workMinutes: number; breakMinutes: number } };

function reducer(state: HaloState, action: Action): HaloState {
  switch (action.type) {
    case "INIT": return action.payload;
    case "SET_VIEW": return { ...state, activeView: action.payload };
    case "UPSERT_NOTE": {
      const idx = state.notes.findIndex((n) => n.id === action.payload.id);
      const notes = idx >= 0 ? state.notes.map((n) => n.id === action.payload.id ? action.payload : n) : [action.payload, ...state.notes];
      return { ...state, notes };
    }
    case "DELETE_NOTE": return { ...state, notes: state.notes.filter((n) => n.id !== action.payload) };
    case "UPSERT_TASK": {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      const tasks = idx >= 0 ? state.tasks.map((t) => t.id === action.payload.id ? action.payload : t) : [action.payload, ...state.tasks];
      return { ...state, tasks };
    }
    case "DELETE_TASK": return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case "SET_WIDGETS": return { ...state, widgets: action.payload };
    case "SET_WEATHER": return { ...state, weatherData: action.payload };
    case "SET_WEATHER_CITY": return { ...state, weatherCity: action.payload };
    case "SET_POMODORO": return { ...state, pomodoroSettings: action.payload };
    default: return state;
  }
}

interface HaloContextValue {
  state: HaloState;
  dispatch: React.Dispatch<Action>;
  setView: (v: ViewKey) => void;
}

const HaloContext = createContext<HaloContextValue | null>(null);

export function HaloStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadState().then((s) => {
      dispatch({ type: "INIT", payload: s });
      initialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  const setView = useCallback((v: ViewKey) => dispatch({ type: "SET_VIEW", payload: v }), []);
  const value = useMemo(() => ({ state, dispatch, setView }), [state, dispatch, setView]);

  return <HaloContext.Provider value={value}>{children}</HaloContext.Provider>;
}

export function useHalo(): HaloContextValue {
  const ctx = useContext(HaloContext);
  if (!ctx) throw new Error("useHalo must be used inside HaloStateProvider");
  return ctx;
}
