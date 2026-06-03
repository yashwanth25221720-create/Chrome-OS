import { memo, useCallback, useState } from "react";
import { useHalo } from "../../../state/HaloStateContext";
import { openUrl } from "../../../lib/chromeApi";

export default memo(function AIProvidersWidget() {
  const { state } = useHalo();
  const [query, setQuery] = useState("");

  const launch = useCallback((id: string) => {
    const provider = state.aiProviders.find((p) => p.id === id);
    if (!provider) return;
    const url = query.trim() && provider.queryTemplate ? provider.queryTemplate.replace("{query}", encodeURIComponent(query.trim())) : provider.url;
    openUrl(url);
  }, [state.aiProviders, query]);

  return (
    <div className="widget-ai">
      <div className="widget-section-title">AI Providers</div>
      <input className="widget-input widget-ai__query" placeholder="Type a prompt then click..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="widget-ai__grid">
        {state.aiProviders.map((p) => (
          <button key={p.id} className="widget-ai__provider" style={{ "--provider-color": p.color } as React.CSSProperties} onClick={() => launch(p.id)} title={p.name}>
            <span className="widget-ai__icon">{p.icon}</span>
            <span className="widget-ai__name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
