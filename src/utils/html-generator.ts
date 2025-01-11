import { Repo } from '../types/repo';

function generateTableRows(repos: Repo[]): string {
  return repos.map(repo => `
    <tr>
      <td><a href="${repo.url}" target="_blank" class="repo-link">${repo.name}</a></td>
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

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  `;
}

function getScoringScript(): string {
  return `
    function toggleScoring() {
      const info = document.getElementById('scoring-info');
      info.classList.toggle('visible');
    }
  `;
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
        <h1>AI Agent Repo Radar</h1>
        <div class="subtitle">Scanning the AI Agent Landscape</div>
        
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
                <div class="links-section">
                    <a href="https://github.com/Abeansits/agent-repo-radar" target="_blank" class="github-link">
                        View source on GitHub →
                    </a>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 20%" data-sort="name">Repository <span class="sort-arrow">↕</span></th>
                    <th style="width: 10%" data-sort="stars">Stars <span class="sort-arrow">↕</span></th>
                    <th style="width: 10%" data-sort="forks">Forks <span class="sort-arrow">↕</span></th>
                    <th style="width: 10%" data-sort="watchers">Watchers <span class="sort-arrow">↕</span></th>
                    <th style="width: 11%" data-sort="created">Created <span class="sort-arrow">↕</span></th>
                    <th style="width: 11%" data-sort="updated">Last Update <span class="sort-arrow">↕</span></th>
                    <th style="width: 16%">Topics</th>
                    <th style="width: 12%" data-sort="score">Score <span class="sort-arrow">↕</span></th>
                </tr>
            </thead>
            <tbody>
                ${generateTableRows(repos)}
            </tbody>
        </table>
        
        <div class="footer">
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    <script>
      ${getThemeScript()}
      ${getScoringScript()}
      ${getSortingScript()}
    </script>
</body>
</html>`;
}
