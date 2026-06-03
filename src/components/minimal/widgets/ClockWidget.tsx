import { memo, useEffect, useState } from "react";

function formatTime(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function formatDate(d: Date) { return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); }

export default memo(function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="widget-clock">
      <div className="widget-clock__time">{formatTime(now)}</div>
      <div className="widget-clock__date">{formatDate(now)}</div>
    </div>
  );
});
