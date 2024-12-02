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
    <title>GitHub Repository Analysis</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #1a1a1a;
            color: #e6e6e6;
            padding: 2rem;
            line-height: 1.6;
        }

        h1 {
            color: #ff6b3d;
            margin-bottom: 2rem;
            font-weight: 600;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background-color: #242424;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        th {
            background-color: #2d2d2d;
            color: #ff6b3d;
            font-weight: 600;
            text-align: left;
            padding: 1rem;
            border-bottom: 2px solid #393939;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid #393939;
        }

        tr:hover {
            background-color: #2a2a2a;
        }

        a {
            color: #ff8f66;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        a:hover {
            color: #ff6b3d;
        }

        .topics {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .topic {
            background-color: rgba(255, 107, 61, 0.1);
            color: #ff8f66;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.85rem;
        }

        .score {
            font-weight: 600;
            color: #ff6b3d;
        }
    </style>
</head>
<body>
    <div class="container">
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
