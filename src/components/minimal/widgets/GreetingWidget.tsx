import { memo } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default memo(function GreetingWidget() {
  return <div className="widget-greeting"><span>{getGreeting()}</span></div>;
});
