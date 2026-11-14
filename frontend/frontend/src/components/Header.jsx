import { ArrowUpRight, Plus } from "lucide-react";

const pageTitles = {
  overview: "Overview",
  documents: "My documents",
  assistant: "AI assistant",
};

export default function Header({ activePage, onUpload }) {
  return (
    <header className="top-header">
      <div className="header-breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>{pageTitles[activePage]}</strong>
      </div>
      <div className="header-actions">
        <span className="header-status"><span /> All systems ready</span>
        <button type="button" className="header-upload" onClick={onUpload}>
          <Plus size={17} />
          <span>Upload document</span>
          <ArrowUpRight size={14} className="upload-arrow" />
        </button>
      </div>
    </header>
  );
}
