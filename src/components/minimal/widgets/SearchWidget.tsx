import { memo, useCallback, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useHalo } from "../../../state/HaloStateContext";
import { buildSearchResults } from "../../../utils/search";
import { openUrl } from "../../../lib/chromeApi";

export default memo(function SearchWidget() {
  const { state, setView } = useHalo();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0 ? buildSearchResults(query, state, setView, openUrl) : [];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    openUrl(url);
    setQuery("");
  }, [query]);

  return (
    <div className="widget-search">
      <form onSubmit={handleSubmit} className="widget-search__form">
        <Search size={16} className="widget-search__icon" />
        <input
          ref={inputRef}
          className="widget-search__input"
          placeholder="Search the web or your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoComplete="off"
        />
      </form>
      {focused && results.length > 0 && (
        <div className="widget-search__dropdown">
          {results.map((r) => (
            <button
              key={r.id}
              className="widget-search__result"
              onMouseDown={() => { r.action(); setQuery(""); }}
            >
              <span className="widget-search__result-icon">{r.icon}</span>
              <span className="widget-search__result-title">{r.title}</span>
              {r.subtitle && <span className="widget-search__result-sub">{r.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
