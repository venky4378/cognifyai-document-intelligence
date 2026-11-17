import { ArrowUpRight, Plus } from "lucide-react";

const pageTitles = {
  overview: "Overview",
  upload: "Upload Document",
  documents: "Document Library",
  assistant: "AI Assistant",
};

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="top-header">
      <div className="header-breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>{pageTitles[activePage] || "Dashboard"}</strong>
      </div>
      <div className="header-actions">
        <span className="header-status"><span /> All systems operational</span>
        {activePage !== "upload" && (
          <button type="button" className="header-upload" onClick={() => onNavigate("upload")}>
            <Plus size={16} />
            <span>Upload document</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
