import axios from 'axios';
import type { AxiosError } from 'axios/index';
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
  } catch (error) {
    const axiosError = error as AxiosError;
    let errorMessage = `Failed to fetch data for ${repoUrl}`;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      switch (status) {
        case 401:
          errorMessage += '\nAuthentication failed. Please check your GitHub token:';
          errorMessage += '\n- Ensure GITHUB_TOKEN environment variable is set correctly';
          errorMessage += '\n- Verify the token has not expired';
          errorMessage += '\n- Confirm the token has the necessary permissions (public_repo access)';
          break;
        case 403:
          errorMessage += '\nAPI rate limit exceeded or resource forbidden:';
          errorMessage += `\n- Response: ${JSON.stringify(data, null, 2)}`;
          if (data.message?.includes('rate limit')) {
            errorMessage += '\n- Consider waiting or using a token with higher rate limits';
          }
          break;
        case 404:
          errorMessage += '\nRepository not found:';
          errorMessage += '\n- Check if the repository URL is correct';
          errorMessage += '\n- Verify the repository is public';
          break;
        default:
          errorMessage += `\nServer responded with status ${status}:`;
          errorMessage += `\n- Response: ${JSON.stringify(data, null, 2)}`;
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      errorMessage += '\nNo response received from GitHub API:';
      errorMessage += '\n- Check your internet connection';
      errorMessage += '\n- GitHub API might be experiencing issues';
    } else {
      // Something happened in setting up the request
      errorMessage += `\nRequest setup error: ${axiosError.message}`;
    }

    console.error(errorMessage);
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