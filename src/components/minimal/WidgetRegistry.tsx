import React, { memo } from "react";
import type { WidgetId } from "../../types/halo";

const ClockWidget = React.lazy(() => import("./widgets/ClockWidget"));
const GreetingWidget = React.lazy(() => import("./widgets/GreetingWidget"));
const SearchWidget = React.lazy(() => import("./widgets/SearchWidget"));
const QuickLinksWidget = React.lazy(() => import("./widgets/QuickLinksWidget"));
const TasksWidget = React.lazy(() => import("./widgets/TasksWidget"));
const NotesWidget = React.lazy(() => import("./widgets/NotesWidget"));
const WeatherWidget = React.lazy(() => import("./widgets/WeatherWidget"));
const PomodoroWidget = React.lazy(() => import("./widgets/PomodoroWidget"));
const AIProvidersWidget = React.lazy(() => import("./widgets/AIProvidersWidget"));

const WIDGET_MAP: Record<WidgetId, React.ComponentType> = {
  clock: ClockWidget, greeting: GreetingWidget, search: SearchWidget, quicklinks: QuickLinksWidget,
  tasks: TasksWidget, notes: NotesWidget, weather: WeatherWidget, pomodoro: PomodoroWidget, aiproviders: AIProvidersWidget,
};

interface Props { id: WidgetId; }
export const WidgetRenderer = memo(function WidgetRenderer({ id }: Props) {
  const Component = WIDGET_MAP[id];
  if (!Component) return null;
  return <React.Suspense fallback={<div className="widget-loading" />}><Component /></React.Suspense>;
});
