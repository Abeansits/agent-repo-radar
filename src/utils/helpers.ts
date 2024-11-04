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