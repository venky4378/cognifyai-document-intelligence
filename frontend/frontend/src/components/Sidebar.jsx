import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "My documents", icon: FileText },
  { id: "assistant", label: "AI assistant", icon: MessageSquareText },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const displayName = user?.name || user?.email?.split("@")[0] || "My account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => onNavigate("overview")}>
        <span className="brand-icon"><Sparkles size={20} /></span>
        <span className="brand-copy">
          <strong>Cognify<span>AI</span></strong>
          <small>DOCUMENT INTELLIGENCE</small>
        </span>
      </a>

      <div className="workspace-pill">
        <span className="workspace-indicator" />
        Personal workspace
      </div>

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
        <div className="sidebar-tip">
          <span className="tip-icon"><Sparkles size={15} /></span>
          <strong>Your docs, understood.</strong>
          <p>Ask a question and find the answer hiding in your files.</p>
        </div>
        <div className="profile">
          <div className="avatar" aria-hidden="true">{initials}</div>
          <div className="profile-info">
            <strong>{displayName}</strong>
            <span>{user?.email || "Signed in"}</span>
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
