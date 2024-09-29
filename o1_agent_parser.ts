import axios from 'axios';
import fs from 'fs/promises';

// Interface to store repository information
interface Repo {
  url: string;
  star_count: number;
  name: string;
  description: string;
  fork_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  aggregate_score: number;
}

function calculateAggregateScore(repo: Repo): number {
  const now = new Date().getTime();
  const createdDate = new Date(repo.created_at).getTime();
  const updatedDate = new Date(repo.updated_at).getTime();
  
  const ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
  const daysSinceUpdate = (now - updatedDate) / (1000 * 60 * 60 * 24);
  
  const starScore = repo.star_count * 0.25;
  const forkScore = repo.fork_count * 0.20;
  const watchersScore = repo.watchers_count * 0.15;
  const ageScore = Math.min(ageInDays / 365, 5) * 2; // Max 10 points for 5 years or older
  const updateScore = Math.max(0, 15 - daysSinceUpdate / 30); // Max 15 points, decreasing by 1 point per month
  // TODO: topicScore should be based on specific topics
  const topicScore = Math.min(repo.topics.length, 5) * 3; // 3 points per topic, up to 5 topics (15 points max)

  return starScore + forkScore + watchersScore + ageScore + updateScore + topicScore;
}

// Fetch raw repository data from GitHub API
async function fetchRepoRawData(repoUrl: string, githubToken: string): Promise<any | null> {
  const repoPath = repoUrl.replace('https://github.com/', '');
  const apiUrl = `https://api.github.com/repos/${repoPath}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'request',
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.mercy-preview+json', // Required to fetch topics
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch data for ${repoUrl}: ${error.message}`);
    return null;
  }
}

// Transform raw repository data into Repo interface
function transformRepoData(rawData: any, repoUrl: string): Repo {
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

// Fetch and transform repository data
async function fetchRepoData(repoUrl: string, githubToken: string): Promise<Repo | null> {
  const rawData = await fetchRepoRawData(repoUrl, githubToken);
  if (rawData) {
    return transformRepoData(rawData, repoUrl);
  }
  return null;
}

// Update min and max values based on repository data
function updateMinMaxValues(repo: Repo, minMax: any): void {
  minMax.minStars = Math.min(minMax.minStars, repo.star_count);
  minMax.maxStars = Math.max(minMax.maxStars, repo.star_count);
  minMax.minForks = Math.min(minMax.minForks, repo.fork_count);
  minMax.maxForks = Math.max(minMax.maxForks, repo.fork_count);
  minMax.minWatchers = Math.min(minMax.minWatchers, repo.watchers_count);
  minMax.maxWatchers = Math.max(minMax.maxWatchers, repo.watchers_count);

  const updatedSinceDays = (new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  minMax.minUpdatedSinceDays = Math.min(minMax.minUpdatedSinceDays, updatedSinceDays);
  minMax.maxUpdatedSinceDays = Math.max(minMax.maxUpdatedSinceDays, updatedSinceDays);

  const createdSinceDays = (new Date().getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
  minMax.minCreatedSinceDays = Math.min(minMax.minCreatedSinceDays, createdSinceDays);
  minMax.maxCreatedSinceDays = Math.max(minMax.maxCreatedSinceDays, createdSinceDays);

  const pushedSinceDays = (new Date().getTime() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  minMax.minPushedSinceDays = Math.min(minMax.minPushedSinceDays, pushedSinceDays);
  minMax.maxPushedSinceDays = Math.max(minMax.maxPushedSinceDays, pushedSinceDays);
}

// Extract GitHub repository URLs from content
function extractGitHubRepoUrls(content: string): Set<string> {
  const githubRepoUrls = new Set<string>();
  const repoUrlRegex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;
  const matches = content.match(repoUrlRegex);
  if (matches) {
    matches.forEach((url) => githubRepoUrls.add(url));
  }
  return githubRepoUrls;
}

// Initialize min and max values
function initializeMinMax(): any {
  return {
    minStars: Infinity, maxStars: -Infinity,
    minForks: Infinity, maxForks: -Infinity,
    minWatchers: Infinity, maxWatchers: -Infinity,
    minUpdatedSinceDays: Infinity, maxUpdatedSinceDays: -Infinity,
    minCreatedSinceDays: Infinity, maxCreatedSinceDays: -Infinity,
    minPushedSinceDays: Infinity, maxPushedSinceDays: -Infinity,
  };
}

// New function to read URLs from a file
async function readUrlsFromFile(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').filter(url => url.trim() !== '');
  } catch (error: any) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return [];
  }
}

// New function to generate markdown table
function generateMarkdownTable(repos: Repo[]): string {
  // Create markdown table header
  let markdownTable = "| Repository | Stars | Forks | Watchers | Created | Last Updated | Topics | Aggregate Score |\n";
  markdownTable += "|------------|-------|-------|----------|---------|--------------|--------|------------------|\n";

  // Add each repository to the markdown table
  repos.forEach((repo) => {
    const createdDate = new Date(repo.created_at).toISOString().split('T')[0];
    const updatedDate = new Date(repo.updated_at).toISOString().split('T')[0];
    const topicsString = repo.topics.slice(0, 3).join(', '); // Limit to first 3 topics

    markdownTable += `| [${repo.name}](${repo.url}) | ${repo.star_count} | ${repo.fork_count} | ${repo.watchers_count} | ${createdDate} | ${updatedDate} | ${topicsString} | ${repo.aggregate_score.toFixed(2)} |\n`;
  });

  return markdownTable;
}

// Main function
// 1. Read URLs from a file
// 2. Extract GitHub repository URLs from content
// 3. Fetch repository data from GitHub API
// 4. Transform repository data into a Repo interface
// 5. Update min and max values based on repository data
// 6. Sort repositories by aggregate score in descending order
// 7. Log the repositories sorted by aggregate score
async function main() {
  try {
    const urlFilePath = process.argv[2];
    if (!urlFilePath) {
      console.error('Please provide a path to the URL file as a command-line argument.');
      return;
    }

    console.log(`Reading URLs from ${urlFilePath}...`);
    const urls = await readUrlsFromFile(urlFilePath);
    console.log(`Found ${urls.length} URLs in the file.`);

    const githubRepoUrls = new Set<string>();
    for (const url of urls) {
      console.log(`Fetching content from ${url}...`);
      const response = await axios.get(url);
      const content: string = response.data as string;
      const extractedUrls = extractGitHubRepoUrls(content);
      extractedUrls.forEach(repoUrl => githubRepoUrls.add(repoUrl));
    }

    console.log(`Found ${githubRepoUrls.size} unique GitHub repositories.`);

    const repos: Repo[] = [];
    let apiCallCount = 0;
    const maxApiCalls = 5;
    
    const minMax = initializeMinMax();

    // Get your GitHub token from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('Error: GitHub token not found in environment variables.');
      console.error('Please set your GitHub token in the GITHUB_TOKEN environment variable.');
      return;
    }

    // Loop through each repository URL to fetch its data
    for (const repoUrl of githubRepoUrls) {
      if (apiCallCount >= maxApiCalls) {
        console.log(`Reached maximum API call limit (${maxApiCalls}). Stopping.`);
        break;
      }

      console.log(`Fetching data for ${repoUrl}...`);
      const repo = await fetchRepoData(repoUrl, githubToken);
      
      if (repo) {
        apiCallCount++;
        updateMinMaxValues(repo, minMax);
        console.log(`Repository ${repoUrl} has ${repo.star_count} stars. (API call ${apiCallCount}/${maxApiCalls})`);
        repos.push(repo);
      }
    }

    // Sort repositories by aggregate score in descending order
    repos.sort((a, b) => b.aggregate_score - a.aggregate_score);

    // Generate and log the markdown table
    const markdownTable = generateMarkdownTable(repos);
    console.log(markdownTable);

    console.log('\nRepositories sorted by aggregate score:');
    repos.forEach((repo) => {
      console.log(`${repo.url} - Aggregate Score: ${repo.aggregate_score.toFixed(2)}, ⭐ ${repo.star_count} stars`);
    });

    console.log(repos);
  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}

// Run the main function
main();

/* Example response from GH API
[
  {
    "id": 1296269,
    "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
    "name": "Hello-World",
    "full_name": "octocat/Hello-World",
    "owner": {
      "login": "octocat",
      "id": 1,
      "node_id": "MDQ6VXNlcjE=",
      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
      "gravatar_id": "",
      "url": "https://api.github.com/users/octocat",
      "html_url": "https://github.com/octocat",
      "followers_url": "https://api.github.com/users/octocat/followers",
      "following_url": "https://api.github.com/users/octocat/following{/other_user}",
      "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
      "organizations_url": "https://api.github.com/users/octocat/orgs",
      "repos_url": "https://api.github.com/users/octocat/repos",
      "events_url": "https://api.github.com/users/octocat/events{/privacy}",
      "received_events_url": "https://api.github.com/users/octocat/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/octocat/Hello-World",
    "description": "This your first repo!",
    "fork": false,
    "url": "https://api.github.com/repos/octocat/Hello-World",
    "archive_url": "https://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
    "assignees_url": "https://api.github.com/repos/octocat/Hello-World/assignees{/user}",
    "blobs_url": "https://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
    "branches_url": "https://api.github.com/repos/octocat/Hello-World/branches{/branch}",
    "collaborators_url": "https://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
    "comments_url": "https://api.github.com/repos/octocat/Hello-World/comments{/number}",
    "commits_url": "https://api.github.com/repos/octocat/Hello-World/commits{/sha}",
    "compare_url": "https://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
    "contents_url": "https://api.github.com/repos/octocat/Hello-World/contents/{+path}",
    "contributors_url": "https://api.github.com/repos/octocat/Hello-World/contributors",
    "deployments_url": "https://api.github.com/repos/octocat/Hello-World/deployments",
    "downloads_url": "https://api.github.com/repos/octocat/Hello-World/downloads",
    "events_url": "https://api.github.com/repos/octocat/Hello-World/events",
    "forks_url": "https://api.github.com/repos/octocat/Hello-World/forks",
    "git_commits_url": "https://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
    "git_refs_url": "https://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
    "git_tags_url": "https://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
    "git_url": "git:github.com/octocat/Hello-World.git",
    "issue_comment_url": "https://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
    "issue_events_url": "https://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
    "issues_url": "https://api.github.com/repos/octocat/Hello-World/issues{/number}",
    "keys_url": "https://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
    "labels_url": "https://api.github.com/repos/octocat/Hello-World/labels{/name}",
    "languages_url": "https://api.github.com/repos/octocat/Hello-World/languages",
    "merges_url": "https://api.github.com/repos/octocat/Hello-World/merges",
    "milestones_url": "https://api.github.com/repos/octocat/Hello-World/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
    "pulls_url": "https://api.github.com/repos/octocat/Hello-World/pulls{/number}",
    "releases_url": "https://api.github.com/repos/octocat/Hello-World/releases{/id}",
    "ssh_url": "git@github.com:octocat/Hello-World.git",
    "stargazers_url": "https://api.github.com/repos/octocat/Hello-World/stargazers",
    "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
    "subscribers_url": "https://api.github.com/repos/octocat/Hello-World/subscribers",
    "subscription_url": "https://api.github.com/repos/octocat/Hello-World/subscription",
    "tags_url": "https://api.github.com/repos/octocat/Hello-World/tags",
    "teams_url": "https://api.github.com/repos/octocat/Hello-World/teams",
    "trees_url": "https://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
    "clone_url": "https://github.com/octocat/Hello-World.git",
    "mirror_url": "git:git.example.com/octocat/Hello-World",
    "hooks_url": "https://api.github.com/repos/octocat/Hello-World/hooks",
    "svn_url": "https://svn.github.com/octocat/Hello-World",
    "homepage": "https://github.com",
    "language": null,
    "forks_count": 9,
    "stargazers_count": 80,
    "watchers_count": 80,
    "size": 108,
    "default_branch": "master",
    "open_issues_count": 0,
    "is_template": false,
    "topics": [
      "octocat",
      "atom",
      "electron",
      "api"
    ],
    "has_issues": true,
    "has_projects": true,
    "has_wiki": true,
    "has_pages": false,
    "has_downloads": true,
    "has_discussions": false,
    "archived": false,
    "disabled": false,
    "visibility": "public",
    "pushed_at": "2011-01-26T19:06:43Z",
    "created_at": "2011-01-26T19:01:12Z",
    "updated_at": "2011-01-26T19:14:43Z",
    "permissions": {
      "admin": false,
      "push": false,
      "pull": true
    },
    "security_and_analysis": {
      "advanced_security": {
        "status": "enabled"
      },
      "secret_scanning": {
        "status": "enabled"
      },
      "secret_scanning_push_protection": {
        "status": "disabled"
      },
      "secret_scanning_non_provider_patterns": {
        "status": "disabled"
      }
    }
  }
]
*/