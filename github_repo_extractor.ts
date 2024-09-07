import axios from 'axios';

interface RepoInfo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  lastPush: string;
}

interface GitHubApiResponse {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
}

async function fetchRepoInfo(repoUrl: string): Promise<RepoInfo> {
  const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  try {
    const response = await axios.get<GitHubApiResponse>(apiUrl);
    const data = response.data;
    console.log(`Successfully fetched info for ${repoUrl}`);
    return {
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      lastPush: data.pushed_at,
    };
  } catch (error: any) {
    console.error(`Error fetching info for ${repoUrl}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    // ... rest of the error handling ...
    return {
      name: repo,
      description: null,
      stars: 0,
      forks: 0,
      openIssues: 0,
      lastPush: 'Unknown',
    };
  }
}

async function extractGitHubRepos(url: string): Promise<RepoInfo[]> {
  try {
    console.log(`Fetching Markdown content from: ${url}`);
    const response = await axios.get(url);
    const markdown = response.data as string;

    console.log('Parsing Markdown content...');
    const githubRepoRegex = /https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+/g;
    const githubRepos = markdown.match(githubRepoRegex) || [];

    const uniqueRepos = Array.from(new Set(githubRepos.map(repo => repo.toLowerCase())));
    console.log(`Found ${uniqueRepos.length} unique GitHub repositories.`);

    console.log('Fetching repository information...');
    const repoInfos = await Promise.all(uniqueRepos.map(fetchRepoInfo));
    return repoInfos;
  } catch (error) {
    console.error('Error fetching or parsing the Markdown:', error);
    return [];
  }
}

const targetUrl = 'https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md';
extractGitHubRepos(targetUrl)
  .then((repoInfos) => {
    console.log('GitHub repositories found:');
    repoInfos.forEach((info, index) => {
      setTimeout(() => {
        console.log(`
Repository Name: ${info.name}
Description: ${info.description || 'No description'}
Stars: ${info.stars}
Forks: ${info.forks}
Open Issues: ${info.openIssues}
Last Push: ${info.lastPush}
        `);
      }, index * 1000); // Delay each log by 1 second
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
