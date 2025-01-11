import { Repo } from '../types/repo';

function generateTableRows(repos: Repo[]): string {
    return repos.map(repo => `
      <tr>
        <td>
          <a href="${repo.url}" target="_blank" class="repo-link">${repo.name}</a>
          ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
        </td>
        <td>${repo.star_count.toLocaleString()}</td>
        <td>${repo.fork_count.toLocaleString()}</td>
        <td>${repo.watchers_count.toLocaleString()}</td>
        <td>${new Date(repo.created_at).toLocaleDateString()}</td>
        <td>${new Date(repo.updated_at).toLocaleDateString()}</td>
        <td>
          <div class="topics">
            ${repo.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}
          </div>
        </td>
        <td><div class="score">${repo.aggregate_score.toFixed(2)}</div></td>
      </tr>
    `).join('');
  }
  
  function getSortingScript(): string {
    return `
      document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
          const table = th.closest('table');
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const sortKey = th.dataset.sort;
          const isAsc = !th.classList.contains('asc');
          
          table.querySelectorAll('th').forEach(header => {
            header.classList.remove('asc', 'desc');
          });
          
          th.classList.add(isAsc ? 'asc' : 'desc');
          
          rows.sort((a, b) => {
            let aVal = a.querySelector(\`td:nth-child(\${th.cellIndex + 1})\`).innerText;
            let bVal = b.querySelector(\`td:nth-child(\${th.cellIndex + 1})\`).innerText;
            
            if (sortKey === 'stars' || sortKey === 'forks' || sortKey === 'watchers' || sortKey === 'score') {
              aVal = parseFloat(aVal.replace(/,/g, ''));
              bVal = parseFloat(bVal.replace(/,/g, ''));
            }
            else if (sortKey === 'created' || sortKey === 'updated') {
              aVal = new Date(aVal);
              bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return isAsc ? -1 : 1;
            if (aVal > bVal) return isAsc ? 1 : -1;
            return 0;
          });
          
          rows.forEach(row => tbody.appendChild(row));
        });
      });
    `;
  }

  function getToggleScoringScript(): string {
    return `
      function toggleScoring() {
        const scoringInfo = document.getElementById('scoring-info');
        scoringInfo.classList.toggle('hidden');
      }
    `;
  }

  function getStyles(): string {
    return `
      :root {
        /* Light theme */
        --light-bg: #ffffff;
        --light-bg-secondary: #f5f7fa;
        --light-border: #e2e8f0;
        --light-text: #1a202c;
        --light-text-secondary: #4a5568;
        --light-primary: #2563eb;
        --light-primary-soft: #dbeafe;
        --light-hover: #f1f5f9;
        --light-table-header: #f8fafc;
  
        /* Dark theme */
        --dark-bg: #0f172a;
        --dark-bg-secondary: #1e293b;
        --dark-border: #334155;
        --dark-text: #e2e8f0;
        --dark-text-secondary: #94a3b8;
        --dark-primary: #60a5fa;
        --dark-primary-soft: rgba(96, 165, 250, 0.1);
        --dark-hover: #2a3a53;
        --dark-table-header: #1e293b;
  
        /* Theme-independent properties */
        --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
        --font-mono: 'IBM Plex Mono', monospace;
      }

    .logo-container {
        text-align: center;
        margin: 2rem 0;
    }

    .logo-container img {
      max-width: 200px;
      height: auto;
    }
  
      /* Default to light theme */
      :root[data-theme="light"] {
        --bg: var(--light-bg);
        --bg-secondary: var(--light-bg-secondary);
        --border: var(--light-border);
        --text: var(--light-text);
        --text-secondary: var(--light-text-secondary);
        --primary: var(--light-primary);
        --primary-soft: var(--light-primary-soft);
        --hover: var(--light-hover);
        --table-header: var(--light-table-header);
      }
  
      /* Dark theme */
      :root[data-theme="dark"] {
        --bg: var(--dark-bg);
        --bg-secondary: var(--dark-bg-secondary);
        --border: var(--dark-border);
        --text: var(--dark-text);
        --text-secondary: var(--dark-text-secondary);
        --primary: var(--dark-primary);
        --primary-soft: var(--dark-primary-soft);
        --hover: var(--dark-hover);
        --table-header: var(--dark-table-header);
      }
  
      * { box-sizing: border-box; margin: 0; padding: 0; }
  
      body {
        background-color: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
        line-height: 1.5;
        padding: 2rem;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
  
      .theme-switch {
        position: fixed;
        top: 1rem;
        right: 1rem;
        width: 40px;
        height: 40px;
        padding: 0.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 50%;
        color: var(--text);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      .theme-switch:hover {
        background: var(--hover);
        transform: scale(1.05);
      }
  
      .theme-switch svg {
        width: 20px;
        height: 20px;
        stroke: var(--text);
      }
  
      .container {
        max-width: 1400px;
        margin: 0 auto;
        position: relative;
        padding: 2rem;
        background: var(--bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--border);
        transition: all 0.3s ease;
      }
  
      h1 {
        color: var(--primary);
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 2.5rem;
        letter-spacing: -0.02em;
      }
  
      .subtitle {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        font-size: 1.1rem;
        font-family: var(--font-mono);
      }
  
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin-top: 2rem;
      }
  
      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border);
        transition: all 0.3s ease;
      }
  
      th {
        background-color: var(--table-header);
        color: var(--primary);
        font-weight: 500;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
  
      tr {
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
  
      tr:hover {
        background-color: var(--hover);
        transform: translateX(4px);
      }
  
      td {
        font-size: 0.9375rem;
      }
  
      .repo-link {
        color: var(--primary);
        font-size: 1.1rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
      }
  
      .repo-link:hover {
        text-decoration: underline;
      }
  
      .score {
        color: var(--primary);
        font-family: var(--font-mono);
        font-weight: 600;
        font-size: 1.1rem;
        padding: 0.25rem 0.75rem;
        background-color: var(--primary-soft);
        border-radius: 6px;
        border: 1px solid var(--border);
        display: inline-block;
      }
  
      .topics {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
  
      .topic {
        background-color: var(--primary-soft);
        color: var(--primary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: var(--font-mono);
        border: 1px solid var(--border);
        transition: all 0.3s ease;
      }
  
      @media (max-width: 1200px) {
        .topics { max-width: 200px; }
        body { padding: 1rem; }
      }
  
      @media (max-width: 768px) {
        .container { padding: 1rem; }
        th, td { padding: 0.75rem; }
        .topics { max-width: 150px; }
      }
  
      .repo-description {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        line-height: 1.4;
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
  
      td:first-child {
        padding-right: 2rem;
      }

      .info-section {
        margin: 2rem 0;
      }

      .info-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        cursor: pointer;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        transition: all 0.2s ease;
      }

      .info-button:hover {
        background: var(--hover);
        transform: translateX(4px);
      }

      .info-icon {
        width: 16px;
        height: 16px;
      }

      .scoring-info {
        margin-top: 1rem;
        padding: 1.5rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .scoring-info.hidden {
        display: none;
      }

      .scoring-info h3 {
        color: var(--primary);
        margin-bottom: 1rem;
        font-size: 1.25rem;
      }

      .scoring-info ul {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
      }

      .scoring-info li {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
        position: relative;
      }

      .scoring-info li:before {
        content: "•";
        color: var(--primary);
        position: absolute;
        left: 0;
      }

      .github-link {
        color: var(--primary);
        text-decoration: none;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        transition: all 0.2s ease;
      }

      .github-link:hover {
        text-decoration: underline;
      }

      .sort-arrow {
        display: inline-block;
        margin-left: 0.25rem;
        opacity: 0.5;
      }

      th[data-sort] {
        cursor: pointer;
      }

      th[data-sort].asc .sort-arrow {
        opacity: 1;
        transform: rotate(180deg);
      }

      th[data-sort].desc .sort-arrow {
        opacity: 1;
      }

      .footer {
        text-align: center;
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: 0.875rem;
      }

      .footer-links {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .footer-date {
        color: var(--text-secondary);
      }

      .description p {
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
      }

      .scoring-info p {
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.6;
      }

      .scoring-info li {
        color: var(--text-secondary);
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        position: relative;
        font-size: 1rem;
      }

      table tr:last-child td {
        border-bottom: none;
      }

      .footer-links iframe {
        transform: scale(0.65);
        transform-origin: center;
        margin: -10px -20px;
      }

      .coffee-button-wrapper {
        transform: scale(0.65);
        transform-origin: left center;
        height: 40px;
        display: flex;
        align-items: center;
      }
    `;
  }
  
  function getThemeScript(): string {
    return `
      function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme);
      }
  
      function updateThemeIcon(theme) {
        const icon = document.getElementById('theme-icon');
        const sunIcon = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        icon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      }
  
      // Set initial theme and icon
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);
    `;
  }
  
  export function generateHtmlTable(repos: Repo[]): string {
    return `
  <!DOCTYPE html>
  <html lang="en" data-theme="dark">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="AI Agent Repo Radar - Discover and analyze AI agent repositories on GitHub">
      <meta name="keywords" content="AI agents, GitHub repositories, repository analysis, AI tools">
      <meta property="og:title" content="AI Agent Repo Radar">
      <meta property="og:description" content="Discover and analyze AI agent repositories on GitHub">
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>">
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
      <title>AI Agent Repo Radar</title>
      <style>${getStyles()}</style>
  </head>
  <body>
      <button class="theme-switch" onclick="toggleTheme()" aria-label="Toggle theme">
          <svg id="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
      </button>
      <div class="container">
        <div class="logo-container">
            <img src="./public/images/logo.png" alt="Agent Repo Radar Logo" width="200">
        </div>
          <h1>AI Agent Repo Radar</h1>
          <div class="subtitle">Scanning the AI Agent Landscape So You Don't Have To</div>

        <div class="description">
            <p>AI Agent Repo Radar helps you discover the most impactful AI agent repositories on GitHub. Our scoring algorithm analyzes community engagement, maintenance patterns, and topic relevance to surface the projects that matter most.</p>
        </div>

        <div class="info-section">
            <button class="info-button" onclick="toggleScoring()">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="8"/>
                </svg>
                How are repositories scored?
            </button>
            <div id="scoring-info" class="scoring-info hidden">
                <h3>Repository Scoring Criteria</h3>
                <p>Our algorithm weighs multiple factors to determine a repository's value:</p>
                <ul>
                    <li>Stars (25%): Community interest and approval</li>
                    <li>Forks (20%): Developer engagement and usage</li>
                    <li>Watchers (15%): Active following</li>
                    <li>Recent Activity (15%): Maintenance and updates</li>
                    <li>Topic Coverage (15%): Relevance to AI agents</li>
                    <li>Repository Age (10%): Project maturity</li>
                </ul>
            </div>
        </div>

          <table>
              <thead>
                  <tr>
                    <th style="width: 22%" data-sort="name">Repository <span class="sort-arrow">↕</span></th>
                    <th style="width: 9%" data-sort="stars">Stars <span class="sort-arrow">↕</span></th>
                    <th style="width: 9%" data-sort="forks">Forks <span class="sort-arrow">↕</span></th>
                    <th style="width: 10%" data-sort="watchers">Watchers <span class="sort-arrow">↕</span></th>
                    <th style="width: 9%" data-sort="created">Created <span class="sort-arrow">↕</span></th>
                    <th style="width: 10%" data-sort="updated">Updated <span class="sort-arrow">↕</span></th>
                    <th style="width: 19%">Topics</th>
                    <th style="width: 12%" data-sort="score">Score <span class="sort-arrow">↕</span></th>
                  </tr>
              </thead>
              <tbody>
                  ${generateTableRows(repos)}
              </tbody>
          </table>

        <div class="footer">
          <div class="footer-links">
            <a href="https://github.com/Abeansits/agent-repo-radar" target="_blank" class="github-link">
              View source on GitHub →
            </a>
            <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" 
              data-name="bmc-button" 
              data-slug="abeansits" 
              data-color="#60a5fa" 
              data-emoji=""  
              data-font="Inter" 
              data-text="Buy me a coffee" 
              data-outline-color="#334155" 
              data-font-color="#ffffff" 
              data-coffee-color="#0f172a" 
              data-height="40"
              data-width="150">
            </script>
          </div>
          <p class="footer-date">Last updated: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <script>${getThemeScript()}</script>
      <script>${getSortingScript()}</script>
      <script>${getToggleScoringScript()}</script>
  </body>
  </html>`;
  }
  