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

export function generateHtmlTable(repos: Repo[]): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
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
      <style>
          :root {
              --radar-green: #00ff88;
              --radar-dark: #1a1a1a;
              --radar-grid: #2d2d2d;
              --radar-pulse: #00ff8833;
              --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
              --font-mono: 'IBM Plex Mono', monospace;
          }
  
          * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
          }
  
          body {
              background-color: var(--radar-dark);
              color: #e6e6e6;
              font-family: var(--font-sans);
              line-height: 1.5;
              padding: 2rem;
          }
  
          .container {
              max-width: 1400px;
              margin: 0 auto;
              position: relative;
              padding: 2rem;
              background: rgba(45, 45, 45, 0.2);
              border-radius: 12px;
              backdrop-filter: blur(10px);
              border: 1px solid var(--radar-grid);
          }
  
          h1 {
              color: var(--radar-green);
              margin-bottom: 0.5rem;
              font-weight: 600;
              font-size: 2.5rem;
              letter-spacing: -0.02em;
          }
  
          .subtitle {
              color: #888;
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
              border-bottom: 1px solid var(--radar-grid);
          }
  
          th {
              background-color: var(--radar-grid);
              color: var(--radar-green);
              font-weight: 500;
              font-family: var(--font-mono);
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
          }
  
          tr:hover {
              background-color: rgba(45, 45, 45, 0.5);
          }
  
          td {
              font-size: 0.9375rem;
          }
  
          a {
              color: var(--radar-green);
              text-decoration: none;
              transition: opacity 0.2s;
          }
  
          a:hover {
              opacity: 0.8;
          }
  
          .score {
              color: var(--radar-green);
              font-family: var(--font-mono);
              font-weight: 500;
          }
  
          .topics {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
          }
  
          .topic {
              background-color: rgba(0, 255, 136, 0.1);
              color: var(--radar-green);
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.75rem;
              font-family: var(--font-mono);
              border: 1px solid rgba(0, 255, 136, 0.2);
          }
  
          /* Enhanced radar pulse animation */
          @keyframes radar-pulse {
              0% { 
                  transform: scaleX(0);
                  opacity: 1;
              }
              100% { 
                  transform: scaleX(1);
                  opacity: 0;
              }
          }
  
          .container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: var(--radar-green);
              transform-origin: left;
              animation: radar-pulse 3s ease-in-out infinite;
          }
  
          /* Responsive design */
          @media (max-width: 1200px) {
              .topics {
                  max-width: 200px;
              }
              body {
                  padding: 1rem;
              }
          }
  
          @media (max-width: 768px) {
              .container {
                  padding: 1rem;
              }
              th, td {
                  padding: 0.75rem;
              }
              .topics {
                  max-width: 150px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>AI Agent Repo Radar</h1>
          <div class="subtitle">Scanning the AI Agent Landscape</div>
          <table>
              <thead>
                  <tr>
                      <th>Repository</th>
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
                  ${repos.map(repo => `
                      <tr>
                          <td><a href="${repo.url}" target="_blank">${repo.name}</a></td>
                          <td>${repo.star_count.toLocaleString()}</td>
                          <td>${repo.fork_count.toLocaleString()}</td>
                          <td>${repo.watchers_count.toLocaleString()}</td>
                          <td>${new Date(repo.created_at).toLocaleDateString()}</td>
                          <td>${new Date(repo.updated_at).toLocaleDateString()}</td>
                          <td>
                              <div class="topics">
                                  ${repo.topics.map(topic => `
                                      <span class="topic">${topic}</span>
                                  `).join('')}
                              </div>
                          </td>
                          <td class="score">${repo.aggregate_score.toFixed(2)}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      </div>
  </body>
  </html>
  `;
  }
  