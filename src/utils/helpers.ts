import fs from 'fs/promises';
import { Repo, MinMaxValues } from '../types/repo';

export function extractGitHubRepoUrls(content: string): Set<string> {
  const githubRepoUrls = new Set<string>();
  const repoUrlRegex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;
  const matches = content.match(repoUrlRegex);
  if (matches) {
    matches.forEach((url) => githubRepoUrls.add(url));
  }
  return githubRepoUrls;
}

export function initializeMinMax(): MinMaxValues {
  return {
    minStars: Infinity, maxStars: -Infinity,
    minForks: Infinity, maxForks: -Infinity,
    minWatchers: Infinity, maxWatchers: -Infinity,
    minUpdatedSinceDays: Infinity, maxUpdatedSinceDays: -Infinity,
    minCreatedSinceDays: Infinity, maxCreatedSinceDays: -Infinity,
    minPushedSinceDays: Infinity, maxPushedSinceDays: -Infinity,
  };
}

export async function readUrlsFromFile(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').filter(url => url.trim() !== '');
  } catch (error: any) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return [];
  }
}

// MARKDOWN TABLE GENERATION

export function generateMarkdownTable(repos: Repo[]): string {
  let markdownTable = "| Repository | Stars | Forks | Watchers | Created | Last Updated | Topics | Aggregate Score |\n";
  markdownTable += "|------------|-------|-------|----------|---------|--------------|--------|------------------|\n";

  repos.forEach((repo) => {
    const createdDate = new Date(repo.created_at).toISOString().split('T')[0];
    const updatedDate = new Date(repo.updated_at).toISOString().split('T')[0];
    const topicsString = repo.topics.slice(0, 3).join(', ');

    markdownTable += `| [${repo.name}](${repo.url}) | ${repo.star_count} | ${repo.fork_count} | ${repo.watchers_count} | ${createdDate} | ${updatedDate} | ${topicsString} | ${repo.aggregate_score.toFixed(2)} |\n`;
  });

  return markdownTable;
}

// HTML TABLE GENERATION

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
        <h1>AI Agent Repo Radar</h1>
        <div class="subtitle">Scanning the AI Agent Landscape</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%">Repository</th>
                    <th>Stars</th>
                    <th>Forks</th>
                    <th>Watchers</th>
                    <th>Created</th>
                    <th>Last Update</th>
                    <th>Topics</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${generateTableRows(repos)}
            </tbody>
        </table>
    </div>
    <script>${getThemeScript()}</script>
</body>
</html>`;
}
