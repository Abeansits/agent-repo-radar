import axios from 'axios';
import fs from 'fs/promises';

interface RepoInfo {
  name: string;
  url: string;
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

const GITHUB_TOKEN = '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';

async function fetchRepoInfo(repoUrl: string): Promise<RepoInfo> {
  const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  try {
    const response = await axios.get<GitHubApiResponse>(apiUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    const data = response.data;
    console.log(`Successfully fetched info for ${repoUrl}`);
    return {
      name: data.name,
      url: repoUrl,
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
    return {
      name: repo,
      url: repoUrl,
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

async function writeToMarkdown(targetUrl: string, repos: RepoInfo[]) {
  const header = `# GitHub Repos from ${targetUrl}\n\n`;
  const tableHeader = '| Name | Description | Stars | Open Issues | Last Push | Repo URL |\n|------|-------------|-------|-------------|-----------|----------|\n';
  const tableRows = repos.map(repo => 
    `| ${repo.name} | ${repo.description || 'N/A'} | ${repo.stars} | ${repo.openIssues} | ${repo.lastPush} | ${repo.url} |`
  ).join('\n');

  const content = header + tableHeader + tableRows;
  await fs.writeFile('github_repos.md', content, 'utf-8');
}

async function main(targetUrl: string) {
  const repoUrls = await extractGitHubRepos(targetUrl);
  const repoInfos = await Promise.all(repoUrls.map(fetchRepoInfo));
  await writeToMarkdown(targetUrl, repoInfos);
  console.log('Results written to github_repos.md');
}

const targetUrl = 'https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md';
main(targetUrl)
  .then(() => {
    console.log('GitHub repositories found:');
    // ... existing code to log each repository ...
  })
  .catch((error) => {
    console.error('Error:', error);
  });
