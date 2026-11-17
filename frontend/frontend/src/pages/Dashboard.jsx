import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  FileSearch,
  FileText,
  Files,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MarkdownViewer from "../components/MarkdownViewer";
import {
  askQuestion,
  deleteDocument,
  getDocuments,
  getErrorMessage,
  uploadDocument,
} from "../services/api";
import "./Dashboard.css";

function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatSourceReference(src) {
  if (!src) return "Indexed Document";
  if (typeof src === "string") return src;
  const fileName = src.fileName || (src.documentId ? `Document #${src.documentId}` : "Indexed File");
  const page = src.pageNumber ? ` (Page ${src.pageNumber})` : (src.chunkIndex != null ? ` (Section ${src.chunkIndex + 1})` : "");
  return `${fileName}${page}`;
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("overview");
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload States & Animation
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(0); // 0=idle, 1=uploading, 2=chunking, 3=embedding, 4=done
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // AI Assistant States
  const chatEndRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your DocuAI Assistant. Ask me anything about your uploaded documents, contracts, or research papers.",
    },
  ]);

  // Document Deletion
  const [deletingId, setDeletingId] = useState(null);

  async function loadDocuments() {
    setLoadingDocuments(true);
    setDocumentError("");
    try {
      const data = await getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setDocumentError(getErrorMessage(err, "Failed to load document library."));
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  // File Selection
  function handleSelectFile(file) {
    setUploadError("");
    setUploadSuccess(false);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF documents are supported for semantic ingestion.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  // Upload with Animated Multi-Stage Processing
  async function handleStartUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(15);
    setUploadStep(1); // Stage 1: Uploading

    // Step 2 timer simulation
    const step2Timer = setTimeout(() => {
      setUploadProgress(45);
      setUploadStep(2); // Stage 2: Chunking
    }, 600);

    // Step 3 timer simulation
    const step3Timer = setTimeout(() => {
      setUploadProgress(80);
      setUploadStep(3); // Stage 3: Embedding
    }, 1400);

    try {
      await uploadDocument(selectedFile);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      setUploadProgress(100);
      setUploadStep(4); // Stage 4: Completed
      setUploadSuccess(true);
      await loadDocuments();
    } catch (err) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setUploadError(getErrorMessage(err, "Upload failed. Please try again."));
      setUploadStep(0);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  // Delete Document
  async function handleDelete(doc) {
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.fileName}"?`)) return;
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      alert(getErrorMessage(err, "Could not delete document."));
    } finally {
      setDeletingId(null);
    }
  }

  // Ask AI
  async function handleAskQuestion(e) {
    e?.preventDefault();
    const query = question.trim();
    if (!query || asking) return;

    setQuestion("");
    setChatError("");
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setAsking(true);

    try {
      const res = await askQuestion(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer || "No relevant information found in the documents.",
          sources: res.sources || [],
        },
      ]);
    } catch (err) {
      setChatError(getErrorMessage(err, "Failed to get AI response. Please retry."));
    } finally {
      setAsking(false);
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Developer";

  // Filtered documents for Library search
  const filteredDocuments = documents.filter((d) =>
    d.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="main-panel">
        <Header activePage={activePage} onNavigate={setActivePage} />

        <div className="dashboard-content">
          {/* =========================================================================
              PAGE 1: OVERVIEW DASHBOARD
              ========================================================================= */}
          {activePage === "overview" && (
            <>
              <section className="welcome-hero">
                <h1>Good to see you, {firstName}.</h1>
                <p>Upload your documents, search your library, and ask questions with AI.</p>
              </section>

              {/* Top 4 Metrics */}
              <section className="metrics-grid">
                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-title">Total Documents</span>
                    <div className="metric-icon-wrap indigo"><Files size={18} /></div>
                  </div>
                  <div className="metric-value">{loadingDocuments ? "—" : documents.length}</div>
                  <div className="metric-subtitle">Uploaded PDF files</div>
                </article>

                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-title">Knowledge Base</span>
                    <div className="metric-icon-wrap emerald"><Database size={18} /></div>
                  </div>
                  <div className="metric-value">Indexed</div>
                  <div className="metric-subtitle">Ready for semantic search</div>
                </article>

                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-title">AI Assistant</span>
                    <div className="metric-icon-wrap purple"><Cpu size={18} /></div>
                  </div>
                  <div className="metric-value">Active</div>
                  <div className="metric-subtitle">Smart answers & citations</div>
                </article>

                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-title">Workspace Status</span>
                    <div className="metric-icon-wrap cyan"><Zap size={18} /></div>
                  </div>
                  <div className="metric-value">Online</div>
                  <div className="metric-subtitle">Private and secure</div>
                </article>
              </section>

              {/* 3 Dedicated Action Hub Cards */}
              <section className="action-hub-grid">
                <div className="action-hub-card" onClick={() => setActivePage("upload")}>
                  <div>
                    <div className="action-hub-icon"><UploadCloud size={24} /></div>
                    <h3>Upload Documents</h3>
                    <p>Add new PDFs to search and analyze them with AI.</p>
                  </div>
                  <span className="action-hub-link">Open Upload Studio <ArrowRight size={15} /></span>
                </div>

                <div className="action-hub-card" onClick={() => setActivePage("documents")}>
                  <div>
                    <div className="action-hub-icon"><Files size={24} /></div>
                    <h3>Document Library</h3>
                    <p>Browse, search, manage, and delete indexed documents in your workspace.</p>
                  </div>
                  <span className="action-hub-link">Manage {documents.length} Files <ArrowRight size={15} /></span>
                </div>

                <div className="action-hub-card" onClick={() => setActivePage("assistant")}>
                  <div>
                    <div className="action-hub-icon"><Bot size={24} /></div>
                    <h3>AI Assistant Studio</h3>
                    <p>Ask questions in natural language and receive instant, cited answers.</p>
                  </div>
                  <span className="action-hub-link">Launch AI Chat <ArrowRight size={15} /></span>
                </div>
              </section>

              {/* Recent Activity Table Preview */}
              <section className="library-studio">
                <div className="library-toolbar">
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#fff" }}>Recent Documents</h3>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Latest files processed in your account</span>
                  </div>
                  <button
                    type="button"
                    className="prompt-chip"
                    onClick={() => setActivePage("documents")}
                  >
                    View All Documents →
                  </button>
                </div>

                {loadingDocuments ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    <LoaderCircle className="spin" size={24} style={{ marginBottom: "8px" }} />
                    <p>Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    <Files size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <p>No documents uploaded yet.</p>
                    <button
                      type="button"
                      className="header-upload"
                      style={{ margin: "16px auto 0" }}
                      onClick={() => setActivePage("upload")}
                    >
                      Upload your first PDF
                    </button>
                  </div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>File Size</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.slice(0, 5).map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div className="table-doc-cell">
                              <span className="pdf-badge">PDF</span>
                              <strong>{doc.fileName}</strong>
                            </div>
                          </td>
                          <td>{formatFileSize(doc.fileSize)}</td>
                          <td>{formatDate(doc.uploadAt)}</td>
                          <td>
                            <span className="status-badge indexed">
                              <CheckCircle2 size={12} /> Indexed
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-delete"
                              disabled={deletingId === doc.id}
                              onClick={() => handleDelete(doc)}
                            >
                              {deletingId === doc.id ? (
                                <LoaderCircle className="spin" size={14} />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}

          {/* =========================================================================
              PAGE 2: DEDICATED UPLOAD STUDIO (With Real-Time Animation Effects)
              ========================================================================= */}
          {activePage === "upload" && (
            <div className="upload-studio">
              <div className="studio-header">
                <h2>Upload Documents</h2>
                <p>Upload your PDFs to search, summarize, and ask questions with AI.</p>
              </div>

              {/* Dropzone */}
              {!uploading && !uploadSuccess && (
                <>
                  <div
                    className={`studio-dropzone ${isDragging ? "dragging" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleSelectFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <div className="dropzone-icon-circle">
                      <UploadCloud size={32} />
                    </div>
                    <h4>Drop your PDF here, or click to browse</h4>
                    <p>Supports technical specs, manuals, research papers, and resumes (PDF up to 25MB)</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleSelectFile(e.target.files?.[0])}
                  />

                  {uploadError && (
                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#f87171", fontSize: "14px" }}>
                      {uploadError}
                    </div>
                  )}

                  {selectedFile && (
                    <div className="selected-file-banner">
                      <div className="file-banner-info">
                        <span className="pdf-badge">PDF</span>
                        <div>
                          <strong>{selectedFile.name}</strong>
                          <div><span>{formatFileSize(selectedFile.size)}</span></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          className="prompt-chip"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X size={14} /> Remove
                        </button>
                        <button
                          type="button"
                          className="header-upload"
                          onClick={handleStartUpload}
                        >
                          <Zap size={16} /> Upload & Process
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* REAL-TIME PROCESSING ANIMATION EFFECT */}
              {uploading && (
                <div className="processing-studio-card">
                  {/* Glowing Radar Animation */}
                  <div className="processing-radar">
                    <Database size={26} color="#818cf8" />
                  </div>

                  <h3>Processing Document...</h3>
                  <p>Please wait while your document is being uploaded and prepared.</p>

                  {/* Progress Bar */}
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>

                  {/* Multi-Step Real-Time Stepper */}
                  <div className="processing-steps">
                    <div className={`proc-step ${uploadStep >= 1 ? (uploadStep > 1 ? "done" : "active") : ""}`}>
                      <div className="proc-step-dot">{uploadStep > 1 ? "✓" : "1"}</div>
                      <span>Uploading PDF document...</span>
                    </div>

                    <div className={`proc-step ${uploadStep >= 2 ? (uploadStep > 2 ? "done" : "active") : ""}`}>
                      <div className="proc-step-dot">{uploadStep > 2 ? "✓" : "2"}</div>
                      <span>Extracting text & indexing sections...</span>
                    </div>

                    <div className={`proc-step ${uploadStep >= 3 ? (uploadStep > 3 ? "done" : "active") : ""}`}>
                      <div className="proc-step-dot">{uploadStep > 3 ? "✓" : "3"}</div>
                      <span>Generating AI index for smart Q&A...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success View */}
              {uploadSuccess && (
                <div className="processing-studio-card" style={{ borderColor: "rgba(16, 185, 129, 0.4)" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3>Document Ready!</h3>
                  <p>Your document is ready for search and questions.</p>

                  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button
                      type="button"
                      className="header-upload"
                      onClick={() => setActivePage("assistant")}
                    >
                      <Bot size={16} /> Ask AI About This Doc
                    </button>
                    <button
                      type="button"
                      className="prompt-chip"
                      onClick={() => setActivePage("documents")}
                    >
                      View in Library
                    </button>
                    <button
                      type="button"
                      className="prompt-chip"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadSuccess(false);
                        setUploadStep(0);
                      }}
                    >
                      Upload Another PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PAGE 3: DEDICATED DOCUMENT MANAGEMENT & LIBRARY
              ========================================================================= */}
          {activePage === "documents" && (
            <div className="library-studio">
              <div className="library-toolbar">
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", color: "#fff" }}>
                    Document Library ({filteredDocuments.length})
                  </h2>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    Search, inspect, and delete documents stored in your account.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className="search-field-wrap">
                    <Search size={16} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search documents by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="prompt-chip"
                    onClick={loadDocuments}
                    disabled={loadingDocuments}
                  >
                    <RefreshCw size={14} className={loadingDocuments ? "spin" : ""} /> Refresh
                  </button>

                  <button
                    type="button"
                    className="header-upload"
                    onClick={() => setActivePage("upload")}
                  >
                    <Plus size={16} /> Upload New
                  </button>
                </div>
              </div>

              {documentError && (
                <div style={{ padding: "12px", background: "rgba(239,68,68,0.15)", borderRadius: "8px", color: "#f87171", marginBottom: "16px" }}>
                  {documentError}
                </div>
              )}

              {loadingDocuments ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                  <LoaderCircle className="spin" size={28} style={{ marginBottom: "12px" }} />
                  <p>Loading your documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                  <FileSearch size={36} style={{ marginBottom: "12px", opacity: 0.5 }} />
                  <h4 style={{ color: "#fff", margin: "0 0 6px 0" }}>No documents found</h4>
                  <p>{searchQuery ? "No documents match your search criteria." : "Your document library is empty."}</p>
                  {!searchQuery && (
                    <button
                      type="button"
                      className="header-upload"
                      style={{ margin: "16px auto 0" }}
                      onClick={() => setActivePage("upload")}
                    >
                      Upload a PDF
                    </button>
                  )}
                </div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Format</th>
                      <th>Size</th>
                      <th>Indexed Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="table-doc-cell">
                            <span className="pdf-badge">PDF</span>
                            <strong title={doc.fileName}>{doc.fileName}</strong>
                          </div>
                        </td>
                        <td><span style={{ color: "#94a3b8" }}>Portable Document Format</span></td>
                        <td>{formatFileSize(doc.fileSize)}</td>
                        <td>{formatDate(doc.uploadAt)}</td>
                        <td>
                          <span className="status-badge indexed">
                            <CheckCircle2 size={12} /> Ready for Q&A
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-delete"
                            disabled={deletingId === doc.id}
                            onClick={() => handleDelete(doc)}
                          >
                            {deletingId === doc.id ? (
                              <LoaderCircle className="spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* =========================================================================
              PAGE 4: DEDICATED AI ASSISTANT / CHAT STUDIO
              ========================================================================= */}
          {activePage === "assistant" && (
            <div className="chat-studio-container">
              {/* Studio Header */}
              <div className="chat-studio-header">
                <div className="chat-title-group">
                  <div className="chat-ai-avatar">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#fff" }}>AI Document Assistant</h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Answers grounded directly in your uploaded files</span>
                  </div>
                </div>

                <div className="chat-context-pill">
                  <Sparkles size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Context: {documents.length} {documents.length === 1 ? "document" : "documents"} loaded
                </div>
              </div>

              {/* Message History */}
              <div className="chat-scroll-area">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble-row ${msg.role}`}>
                    {msg.role === "assistant" && (
                      <div className="chat-ai-avatar" style={{ width: "30px", height: "30px" }}>
                        <Bot size={16} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="chat-bubble">
                        <MarkdownViewer content={msg.text} />
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="chat-sources-container">
                            <span className="sources-label">Grounded Citations</span>
                            <div className="sources-badges-row">
                              {msg.sources.map((src, sIdx) => (
                                <span key={sIdx} className="source-badge-pill">
                                  <FileText size={13} />
                                  <span>{formatSourceReference(src)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {asking && (
                  <div className="chat-bubble-row assistant">
                    <div className="chat-ai-avatar" style={{ width: "30px", height: "30px" }}>
                      <Bot size={16} />
                    </div>
                    <div className="chat-bubble" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <LoaderCircle className="spin" size={16} color="#818cf8" />
                      <span>DocuAI is reading vectors & generating answer...</span>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.15)", borderRadius: "8px", color: "#f87171", fontSize: "13px" }}>
                    {chatError}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Dock with Shortcut Chips */}
              <div className="chat-input-dock">
                <div className="prompt-chips-row">
                  <button
                    type="button"
                    className="prompt-chip"
                    onClick={() => setQuestion("Summarize the key points of my uploaded documents.")}
                  >
                    Summarize key points
                  </button>
                  <button
                    type="button"
                    className="prompt-chip"
                    onClick={() => setQuestion("What are the most important requirements or conclusions?")}
                  >
                    Important requirements
                  </button>
                  <button
                    type="button"
                    className="prompt-chip"
                    onClick={() => setQuestion("Extract action items and key details.")}
                  >
                    Extract action items
                  </button>
                </div>

                <form onSubmit={handleAskQuestion} className="chat-form">
                  <input
                    type="text"
                    placeholder={
                      documents.length === 0
                        ? "Please upload a PDF document first to ask questions..."
                        : "Ask anything about your documents..."
                    }
                    value={question}
                    disabled={asking || documents.length === 0}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={asking || !question.trim() || documents.length === 0}
                  >
                    {asking ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
