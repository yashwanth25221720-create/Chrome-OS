import { memo, useState } from "react";
import { Plus, X } from "lucide-react";
import { openUrl } from "../../../lib/chromeApi";

interface QuickLink { id: string; label: string; url: string; icon?: string; }
const STORAGE_KEY = "halo_quick_links";
function loadLinks(): QuickLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultLinks;
  } catch {
    return defaultLinks;
  }
}
function saveLinks(links: QuickLink[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(links)); }
const defaultLinks: QuickLink[] = [
  { id: "1", label: "GitHub", url: "https://github.com", icon: "⚙" },
  { id: "2", label: "Gmail", url: "https://mail.google.com", icon: "✉" },
  { id: "3", label: "YouTube", url: "https://youtube.com", icon: "▶" },
];

export default memo(function QuickLinksWidget() {
  const [links, setLinks] = useState<QuickLink[]>(loadLinks);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function addLink() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    const link: QuickLink = { id: crypto.randomUUID(), label: newLabel.trim(), url };
    const updated = [...links, link];
    setLinks(updated);
    saveLinks(updated);
    setNewLabel("");
    setNewUrl("");
    setAdding(false);
  }

  function removeLink(id: string) {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveLinks(updated);
  }

  return (
    <div className="widget-quicklinks">
      <div className="widget-quicklinks__grid">
        {links.map((link) => (
          <div key={link.id} className="widget-quicklinks__item-wrap">
            <button className="widget-quicklinks__item" onClick={() => openUrl(link.url)} title={link.url}>
              {link.icon ? (
                <span className="widget-quicklinks__item-icon">{link.icon}</span>
              ) : (
                <span className="widget-quicklinks__item-icon">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`} alt="" width={20} height={20} loading="lazy" />
                </span>
              )}
              <span className="widget-quicklinks__item-label">{link.label}</span>
            </button>
            <button className="widget-quicklinks__remove" onClick={() => removeLink(link.id)}><X size={10} /></button>
          </div>
        ))}
        <button className="widget-quicklinks__add" onClick={() => setAdding(true)}><Plus size={16} /></button>
      </div>
      {adding && (
        <div className="widget-quicklinks__form">
          <input className="widget-input" placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} autoFocus />
          <input className="widget-input" placeholder="URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} />
          <div className="widget-quicklinks__form-btns">
            <button className="widget-btn-primary" onClick={addLink}>Add</button>
            <button className="widget-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
});
