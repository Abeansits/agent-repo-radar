import axios from 'axios';
import { Repo } from '../types/repo';
import { calculateAggregateScore } from '../utils/scoring';

export async function fetchRepoRawData(repoUrl: string, githubToken: string): Promise<any | null> {
  const repoPath = repoUrl.replace('https://github.com/', '');
  const apiUrl = `https://api.github.com/repos/${repoPath}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'request',
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.mercy-preview+json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch data for ${repoUrl}: ${error.message}`);
    return null;
  }
}

export function transformRepoData(rawData: any, repoUrl: string): Repo {
  const repo: Repo = {
    url: repoUrl,
    star_count: rawData.stargazers_count,
    name: rawData.name,
    description: rawData.description || '',
    fork_count: rawData.forks_count,
    watchers_count: rawData.watchers_count,
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
    pushed_at: rawData.pushed_at,
    topics: rawData.topics || [],
    aggregate_score: 0,
  };
  repo.aggregate_score = calculateAggregateScore(repo);
  return repo;
}

export async function fetchRepoData(repoUrl: string, githubToken: string): Promise<Repo | null> {
  const rawData = await fetchRepoRawData(repoUrl, githubToken);
  if (rawData) {
    return transformRepoData(rawData, repoUrl);
  }
  return null;
} 