import {
  Files,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Sparkles,
  UploadCloud,
} from "lucide-react";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload", label: "Upload document", icon: UploadCloud },
  { id: "documents", label: "Document library", icon: Files },
  { id: "assistant", label: "AI assistant", icon: MessageSquareText },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const displayName = user?.name || user?.email?.split("@")[0] || "Developer Account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={(e) => { e.preventDefault(); onNavigate("overview"); }}>
        <span className="brand-icon"><Sparkles size={20} /></span>
        <span className="brand-copy">
          <strong>Docu<span>AI</span></strong>
          <small>DOCUMENT INTELLIGENCE</small>
        </span>
      </a>



      <nav className="nav-section" aria-label="Main navigation">
        <p className="nav-label">WORKSPACE</p>
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item ${activePage === id ? "active" : ""}`}
            aria-current={activePage === id ? "page" : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {id === "assistant" && <span className="nav-new">AI</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile">
          <div className="avatar" aria-hidden="true">{initials}</div>
          <div className="profile-info">
            <strong>{displayName}</strong>
            <span>{user?.email || "Connected"}</span>
          </div>
          <button
            type="button"
            className="logout-button"
            aria-label="Sign out"
            title="Sign out"
            onClick={onLogout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
