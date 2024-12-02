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
    <title>AI Agent Repo Radar</title>
    <style>
        /* Existing styles... */

        /* Adding radar-like color scheme */
        :root {
            --radar-green: #00ff88;
            --radar-dark: #1a1a1a;
            --radar-grid: #2d2d2d;
            --radar-pulse: #00ff8833;
        }

        body {
            background-color: var(--radar-dark);
            color: #e6e6e6;
        }

        h1 {
            color: var(--radar-green);
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #888;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }

        th {
            background-color: var(--radar-grid);
            color: var(--radar-green);
        }

        .score {
            color: var(--radar-green);
        }

        .topic {
            background-color: rgba(0, 255, 136, 0.1);
            color: var(--radar-green);
        }

        /* Pulse animation for the radar effect */
        @keyframes radar-pulse {
            0% { box-shadow: 0 0 0 0 var(--radar-pulse); }
            70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }

        .container {
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--radar-green);
            animation: radar-pulse 2s infinite;
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
