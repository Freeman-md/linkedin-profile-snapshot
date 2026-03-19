export const POPUP_STYLES = `
  :root {
    color-scheme: light;
    --bg: #f4f7fb;
    --panel: rgba(255, 255, 255, 0.92);
    --panel-strong: #ffffff;
    --text: #102033;
    --muted: #617085;
    --accent: #0a66c2;
    --accent-strong: #004182;
    --border: rgba(16, 32, 51, 0.1);
    --success: #0f7d40;
    --warning: #9a5b00;
    --danger: #b42318;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 380px;
    background:
      radial-gradient(circle at top, rgba(10, 102, 194, 0.14), transparent 42%),
      linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
    color: var(--text);
    font-family: Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .shell {
    padding: 16px;
  }

  .panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(16, 32, 51, 0.12);
    overflow: hidden;
  }

  .hero {
    padding: 18px 18px 14px;
    background: linear-gradient(135deg, rgba(10, 102, 194, 0.12), rgba(255, 255, 255, 0.6));
    border-bottom: 1px solid var(--border);
  }

  .eyebrow {
    margin: 0 0 6px;
    color: var(--accent-strong);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
  }

  .subtle {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.45;
  }

  .content {
    padding: 16px 18px 18px;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  button {
    appearance: none;
    border: 0;
    border-radius: 999px;
    padding: 10px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    cursor: wait;
    opacity: 0.72;
  }

  .primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    color: white;
    box-shadow: 0 10px 18px rgba(10, 102, 194, 0.24);
  }

  .secondary {
    background: rgba(16, 32, 51, 0.06);
    color: var(--text);
  }

  .status {
    margin: 0 0 14px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--muted);
  }

  .status.good {
    color: var(--success);
  }

  .status.bad {
    color: var(--warning);
  }

  .grid {
    display: grid;
    gap: 10px;
  }

  .field {
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--panel-strong);
    padding: 12px 12px 10px;
  }

  .label {
    margin: 0 0 6px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .value {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .section {
    margin-top: 14px;
  }

  .section h2 {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--text);
  }

  .items {
    display: grid;
    gap: 8px;
  }

  .item {
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(16, 32, 51, 0.04);
    border: 1px solid rgba(16, 32, 51, 0.08);
    font-size: 13px;
    line-height: 1.45;
  }

  .toast {
    margin-top: 10px;
    min-height: 18px;
    font-size: 12px;
    color: var(--success);
  }

  .toast.error {
    color: var(--danger);
  }
`;
