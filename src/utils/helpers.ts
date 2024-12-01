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
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>GitHub Repository Analysis</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #4CAF50;
      color: white;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .repo-link {
      color: #0366d6;
      text-decoration: none;
    }
    .repo-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>GitHub Repository Analysis</h1>
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
          <td><a href="${repo.url}" class="repo-link">${repo.name}</a></td>
          <td>${repo.star_count}</td>
          <td>${repo.fork_count}</td>
          <td>${repo.watchers_count}</td>
          <td>${new Date(repo.created_at).toLocaleDateString()}</td>
          <td>${new Date(repo.updated_at).toLocaleDateString()}</td>
          <td>${repo.topics.slice(0, 3).join(', ')}</td>
          <td>${repo.aggregate_score.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  return htmlContent;
} 