import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  CircleHelp,
  FileText,
  Files,
  FileUp,
  LoaderCircle,
  MessageSquareText,
  MoreHorizontal,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  askQuestion,
  deleteDocument,
  getDocuments,
  getErrorMessage,
  uploadDocument,
} from "../services/api";

function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "Recently uploaded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently uploaded"
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

async function fetchDocuments() {
  const result = await getDocuments();
  if (!Array.isArray(result)) {
    throw new Error("The document service returned an unexpected response.");
  }
  return result;
}

function DocumentRows({ documents, onDelete, deletingId }) {
  if (!documents.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Files size={24} /></span>
        <h3>Your library is ready for its first document</h3>
        <p>Upload a PDF and CognifyAI will make it searchable and ready for questions.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <article className="document-row" key={document.id}>
          <span className="document-file-icon"><FileText size={19} /></span>
          <div className="document-info">
            <strong title={document.fileName}>{document.fileName}</strong>
            <span>{formatFileSize(document.fileSize)} <i /> {formatDate(document.uploadAt)}</span>
          </div>
          <span className="document-ready"><Check size={14} /> Ready</span>
          <button
            type="button"
            className="document-delete"
            aria-label={`Delete ${document.fileName}`}
            title="Delete document"
            disabled={deletingId === document.id}
            onClick={() => onDelete(document)}
          >
            {deletingId === document.id ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
          </button>
        </article>
      ))}
    </div>
  );
}

function UploadCard({ inputRef, selectedFile, uploading, message, messageType, onFileChange, onClear, onUpload, onDrop }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    onDrop(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="panel upload-panel" id="upload">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">GET STARTED</span>
          <h2>Bring your documents in</h2>
          <p>Drop in a PDF to add it to your workspace.</p>
        </div>
        <span className="panel-heading-icon"><FileUp size={19} /></span>
      </div>
      <button
        type="button"
        className={`dropzone ${dragging ? "dragging" : ""}`}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="upload-icon"><UploadCloud size={24} /></span>
        <strong>{selectedFile ? selectedFile.name : "Drop your PDF here, or browse"}</strong>
        <span>{selectedFile ? `${formatFileSize(selectedFile.size)} selected` : "PDF files are supported"}</span>
      </button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileChange}
        aria-label="Choose a PDF document"
      />
      {selectedFile && (
        <div className="upload-actions">
          <button type="button" className="text-button" onClick={onClear} disabled={uploading}>
            <X size={15} /> Remove
          </button>
          <button type="button" className="primary-button" onClick={onUpload} disabled={uploading}>
            {uploading ? <><LoaderCircle className="spin" size={16} /> Uploading</> : <><UploadCloud size={16} /> Upload PDF</>}
          </button>
        </div>
      )}
      {message && (
        <p className={`inline-message ${messageType}`} role={messageType === "error" ? "alert" : "status"}>
          {messageType === "success" ? <CheckCircle2 size={16} /> : <CircleHelp size={16} />}
          <span>{message}</span>
        </p>
      )}
    </section>
  );
}

export default function Dashboard({ user, onLogout }) {
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [activePage, setActivePage] = useState("overview");
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadMessageType, setUploadMessageType] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState([]);

  async function loadDocuments(showLoader = false) {
    if (showLoader) {
      setLoadingDocuments(true);
      setDocumentError("");
    }
    try {
      setDocuments(await fetchDocuments());
    } catch (error) {
      setDocumentError(getErrorMessage(error, "Unable to load your documents."));
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchDocuments()
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((error) => {
        if (active) setDocumentError(getErrorMessage(error, "Unable to load your documents."));
      })
      .finally(() => {
        if (active) setLoadingDocuments(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, asking]);

  function chooseFile(file) {
    setUploadMessage("");
    setUploadMessageType("");
    if (!file) {
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setUploadMessage("Choose a PDF file to upload.");
      setUploadMessageType("error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
  }

  function handleFileChange(event) {
    chooseFile(event.target.files?.[0]);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadMessage("");
    try {
      await uploadDocument(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setUploadMessage("Your document has been added to the library.");
      setUploadMessageType("success");
      await loadDocuments(true);
    } catch (error) {
      setUploadMessage(getErrorMessage(error, "Upload failed. Please try again."));
      setUploadMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(document) {
    if (!window.confirm(`Delete "${document.fileName}" from your workspace?`)) return;
    setDeletingId(document.id);
    setDocumentError("");
    try {
      await deleteDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    } catch (error) {
      setDocumentError(getErrorMessage(error, "Unable to delete this document."));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAsk(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || asking || !documents.length) return;

    setQuestion("");
    setChatError("");
    setMessages((current) => [...current, { role: "user", text }]);
    setAsking(true);
    try {
      const result = await askQuestion(text);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, sources: result.sources || [] },
      ]);
    } catch (error) {
      setChatError(getErrorMessage(error, "We couldn't get an answer. Please try again."));
    } finally {
      setAsking(false);
    }
  }

  function startQuestion(text) {
    setQuestion(text);
    setActivePage("assistant");
  }

  function openUploader() {
    setActivePage("overview");
    window.setTimeout(() => inputRef.current?.click(), 0);
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const pageCopy = {
    overview: {
      eyebrow: "YOUR PERSONAL KNOWLEDGE HUB",
      title: `Good to see you, ${firstName}.`,
      description: "Your documents are ready when you are. Pick up where you left off or add something new.",
    },
    documents: {
      eyebrow: "YOUR LIBRARY",
      title: "All your documents, in one place.",
      description: "Manage your files and keep your knowledge organized.",
    },
    assistant: {
      eyebrow: "ASK YOUR DOCUMENTS",
      title: "What would you like to know?",
      description: "Ask a question in your own words. CognifyAI will look across your uploaded documents.",
    },
  }[activePage];

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} onLogout={onLogout} />
      <main className="main-panel">
        <Header activePage={activePage} onUpload={openUploader} />
        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> {pageCopy.eyebrow}</div>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.description}</p>
            </div>
            <div className="welcome-decoration" aria-hidden="true">
              <div className="welcome-orbit"><Sparkles size={23} /></div>
              <span className="orbit-dot" />
            </div>
          </section>

          {activePage === "overview" && (
            <>
              <section className="stats-grid" aria-label="Workspace summary">
                <article className="stat-card">
                  <div className="stat-top"><span className="stat-label">Documents</span><span className="stat-icon lavender"><Files size={18} /></span></div>
                  <strong className="stat-value">{loadingDocuments ? "—" : documents.length}</strong>
                  <span className="stat-description">In your workspace</span>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span className="stat-label">Workspace</span><span className="stat-icon peach"><Sparkles size={18} /></span></div>
                  <strong className="stat-value stat-word">Ready to explore</strong>
                  <span className="stat-description">Your AI assistant is standing by</span>
                </article>
                <button className="stat-card stat-action" type="button" onClick={() => setActivePage("assistant")}>
                  <div className="stat-top"><span className="stat-label">Need an answer?</span><span className="stat-icon mint"><MessageSquareText size={18} /></span></div>
                  <strong className="stat-value stat-word">Ask your documents <ArrowRight size={17} /></strong>
                  <span className="stat-description">Get insights from your files</span>
                </button>
              </section>

              <section className="content-grid">
                <UploadCard
                  inputRef={inputRef}
                  selectedFile={selectedFile}
                  uploading={uploading}
                  message={uploadMessage}
                  messageType={uploadMessageType}
                  onFileChange={handleFileChange}
                  onClear={() => chooseFile(null)}
                  onUpload={handleUpload}
                  onDrop={chooseFile}
                />
                <section className="panel prompt-panel">
                  <div className="prompt-art"><Sparkles size={20} /></div>
                  <span className="panel-kicker">MEET YOUR AI ASSISTANT</span>
                  <h2>Curiosity, meet clarity.</h2>
                  <p>Ask a question and get a helpful answer grounded in the documents you upload.</p>
                  <button type="button" className="prompt-link" onClick={() => setActivePage("assistant")}>
                    Start a conversation <ArrowRight size={16} />
                  </button>
                  <div className="prompt-example">
                    <span>TRY ASKING</span>
                    <button type="button" onClick={() => startQuestion("What are the key points in my documents?")}>
                      “What are the key points in my documents?”
                    </button>
                  </div>
                </section>
              </section>

              <section className="panel documents-panel">
                <div className="section-title-row">
                  <div><span className="panel-kicker">RECENT ACTIVITY</span><h2>Your documents</h2></div>
                  {documents.length > 0 && <button className="subtle-button" type="button" onClick={() => setActivePage("documents")}>View all <ArrowRight size={15} /></button>}
                </div>
                {documentError && <p className="inline-message error" role="alert"><CircleHelp size={16} />{documentError}<button type="button" className="retry-button" onClick={loadDocuments}>Try again</button></p>}
                {loadingDocuments ? (
                  <div className="loading-state"><LoaderCircle className="spin" size={20} /> Loading your documents...</div>
                ) : (
                  <DocumentRows documents={documents.slice(0, 4)} onDelete={handleDelete} deletingId={deletingId} />
                )}
              </section>
            </>
          )}

          {activePage === "documents" && (
            <section className="panel documents-panel library-panel">
              <div className="section-title-row">
                <div><span className="panel-kicker">DOCUMENT LIBRARY</span><h2>{documents.length} {documents.length === 1 ? "document" : "documents"}</h2></div>
                <button className="subtle-button" type="button" onClick={() => loadDocuments(true)} disabled={loadingDocuments}><ArrowDown size={15} /> Refresh</button>
              </div>
              {documentError && <p className="inline-message error" role="alert"><CircleHelp size={16} />{documentError}<button type="button" className="retry-button" onClick={() => loadDocuments(true)}>Try again</button></p>}
              {loadingDocuments ? (
                <div className="loading-state"><LoaderCircle className="spin" size={20} /> Loading your documents...</div>
              ) : (
                <DocumentRows documents={documents} onDelete={handleDelete} deletingId={deletingId} />
              )}
              <div className="library-upload-hint"><UploadCloud size={17} /><span>Have another PDF? <button type="button" onClick={openUploader}>Upload it from your overview</button></span></div>
            </section>
          )}

          {activePage === "assistant" && (
            <div className="assistant-layout">
              <section className="panel chat-panel">
                <div className="chat-heading">
                  <span className="assistant-badge"><Sparkles size={19} /></span>
                  <div><strong>Cognify assistant</strong><span>Answers grounded in your documents</span></div>
                  <span className="online-indicator"><i /> Ready</span>
                </div>
                <div className="chat-messages" aria-live="polite">
                  {messages.length === 0 ? (
                    <div className="chat-welcome">
                      <span className="chat-welcome-icon"><MessageSquareText size={24} /></span>
                      <h2>Start with a question</h2>
                      <p>Your assistant can search across all the PDFs in your library.</p>
                      {documents.length > 0 ? (
                        <div className="suggestion-list">
                          {["Summarize my documents", "What are the main takeaways?", "Find important dates and deadlines"].map((suggestion) => (
                            <button key={suggestion} type="button" onClick={() => startQuestion(suggestion)}>{suggestion}<ArrowUp size={14} /></button>
                          ))}
                        </div>
                      ) : (
                        <button className="text-button" type="button" onClick={() => setActivePage("overview")}>Upload a PDF to get started <ArrowRight size={15} /></button>
                      )}
                    </div>
                  ) : messages.map((message, index) => (
                    <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                      {message.role === "assistant" && <span className="message-avatar"><Sparkles size={14} /></span>}
                      <div className="message-content">
                        <span className="message-author">{message.role === "assistant" ? "Cognify assistant" : "You"}</span>
                        <p>{message.text}</p>
                        {message.sources?.length > 0 && (
                          <div className="source-list">
                            <span>Sources</span>
                            {message.sources.map((source, sourceIndex) => (
                              <span className="source-chip" key={`${source.documentId}-${sourceIndex}`}>
                                <FileText size={13} /> {source.fileName || `Document ${source.documentId}`}
                                {source.pageNumber ? ` · p. ${source.pageNumber}` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {asking && <div className="thinking-state"><LoaderCircle className="spin" size={16} /> Looking through your documents...</div>}
                  <div ref={chatEndRef} />
                </div>
                {chatError && <p className="inline-message error chat-error" role="alert">{chatError}</p>}
                <form className="chat-composer" onSubmit={handleAsk}>
                  <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={documents.length ? "Ask anything about your documents..." : "Upload a PDF to start asking questions"}
                    aria-label="Ask a question about your documents"
                    disabled={!documents.length || asking}
                  />
                  <button type="submit" aria-label="Send question" disabled={!documents.length || !question.trim() || asking}>
                    {asking ? <LoaderCircle className="spin" size={18} /> : <Send size={17} />}
                  </button>
                </form>
                <p className="chat-disclaimer">AI can make mistakes. Check important details against the source documents.</p>
              </section>
              <aside className="panel assistant-aside">
                <span className="panel-kicker">A FEW IDEAS</span>
                <h3>Good questions get you further.</h3>
                <p>Try asking for a summary, comparing details, or finding something specific.</p>
                <div className="idea-list">
                  <button type="button" onClick={() => startQuestion("Give me a short summary of my documents.")}><span className="idea-icon lilac"><FileText size={16} /></span><span><strong>Summarize</strong><small>Get the important points</small></span><ArrowRight size={14} /></button>
                  <button type="button" onClick={() => startQuestion("What are the key dates or deadlines?")}><span className="idea-icon peach"><CircleHelp size={16} /></span><span><strong>Find details</strong><small>Look up dates and facts</small></span><ArrowRight size={14} /></button>
                  <button type="button" onClick={() => startQuestion("What topics are covered in my documents?")}><span className="idea-icon mint"><MoreHorizontal size={16} /></span><span><strong>Explore topics</strong><small>See what's inside</small></span><ArrowRight size={14} /></button>
                </div>
                <div className="assistant-note"><Sparkles size={15} /><span>Answers include source references when available, so you can verify the details.</span></div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
