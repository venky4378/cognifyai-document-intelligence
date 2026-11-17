import React from "react";

// Helper to format inline markdown like **bold**, *italic*, `code`, and <br>
function formatInlineText(text) {
  if (!text) return "";

  // Split by bold (**text**)
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, i) => {
    if (typeof part !== "string") return part;

    // Check for inline code `code`
    const codeParts = part.split(/`([^`]+)`/g);
    if (codeParts.length > 1) {
      return codeParts.map((sub, j) =>
        j % 2 === 1 ? <code key={`${i}-${j}`} className="chat-inline-code">{sub}</code> : sub
      );
    }
    return part;
  });
}

// Check if a line is a markdown table separator (e.g. |---|---|)
function isTableSeparator(line) {
  return /^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(line);
}

// Parse markdown table rows
function parseTable(lines) {
  const headerLine = lines[0];
  const dataLines = lines.slice(2); // Skip separator

  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  const rows = dataLines.map((rowLine) =>
    rowLine
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell, idx, arr) => (idx > 0 && idx < arr.length - 1) || cell.length > 0)
  );

  return (
    <div className="table-responsive-wrapper" key={Math.random()}>
      <table className="chat-markdown-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{formatInlineText(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{formatInlineText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownViewer({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let currentList = [];
  let tableLines = [];
  let inTable = false;

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul className="chat-markdown-list" key={elements.length}>
          {currentList.map((item, idx) => (
            <li key={idx}>{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  }

  function flushTable() {
    if (tableLines.length >= 2) {
      elements.push(parseTable(tableLines));
    }
    tableLines = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Table Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 2. Headings (###, ##, #)
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 className="chat-heading-3" key={elements.length}>
          {formatInlineText(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 className="chat-heading-2" key={elements.length}>
          {formatInlineText(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 className="chat-heading-1" key={elements.length}>
          {formatInlineText(trimmed.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // 3. Bullet list (- or • or *)
    if (/^[-*•]\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[-*•]\s+/, ""));
      continue;
    } else {
      flushList();
    }

    // 4. Horizontal Rule
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr className="chat-markdown-hr" key={elements.length} />);
      continue;
    }

    // 5. Empty line
    if (!trimmed) {
      continue;
    }

    // 6. Regular Paragraph
    elements.push(
      <p className="chat-paragraph" key={elements.length}>
        {formatInlineText(trimmed)}
      </p>
    );
  }

  flushList();
  if (inTable) flushTable();

  return <div className="markdown-rendered-view">{elements}</div>;
}
