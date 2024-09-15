import axios from 'axios';

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
  const topicScore = repo.topics.length * 3; // 3 points per topic, up to 5 topics (15 points max)

  return starScore + forkScore + watchersScore + ageScore + updateScore + topicScore;
}

async function main() {
  try {
    const url = 'https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md';
    console.log(`Fetching content from ${url}...`);

    // Fetch the content of the page
    const response = await axios.get(url);
    const contentType = response.headers['content-type'];
    const content: string = response.data as string;

    console.log(`Content type: ${contentType}`);
    console.log('Extracting GitHub repository links...');

    // Regular expression to find GitHub repository URLs
    const githubRepoUrls = new Set<string>();
    const repoUrlRegex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;

    // Extract all matching GitHub repo URLs
    const matches = content.match(repoUrlRegex);
    if (matches) {
      matches.forEach((url) => githubRepoUrls.add(url));
    }

    console.log(`Found ${githubRepoUrls.size} GitHub repositories.`);

    const repos: Repo[] = [];
    let apiCallCount = 0;
    const maxApiCalls = 10;
    
    let minStars = Infinity, maxStars = -Infinity;
    let minForks = Infinity, maxForks = -Infinity;
    let minWatchers = Infinity, maxWatchers = -Infinity;
    let minUpdatedSinceDays = Infinity, maxUpdatedSinceDays = -Infinity;
    let minCreatedSinceDays = Infinity, maxCreatedSinceDays = -Infinity;
    let minPushedSinceDays = Infinity, maxPushedSinceDays = -Infinity;

    // Get your GitHub token from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('Error: GitHub token not found in environment variables.');
      console.error('Please set your GitHub token in the GITHUB_TOKEN environment variable.');
      return;
    }

    // Loop through each repository URL to fetch it's data
    for (const repoUrl of githubRepoUrls) {
      if (apiCallCount >= maxApiCalls) {
        console.log(`Reached maximum API call limit (${maxApiCalls}). Stopping.`);
        break;
      }

      console.log(`Fetching data for ${repoUrl}...`);

      // Extract the user and repository name from the URL
      const repoPath = repoUrl.replace('https://github.com/', '');

      try {
        // Fetch repository data from GitHub API
        const apiUrl = `https://api.github.com/repos/${repoPath}`;
        const repoResponse = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'request',
            'Authorization': `token ${githubToken}`,
          },
        });
        apiCallCount++;
        
        const repoData = repoResponse.data as any;
        const repo: Repo = {
          url: repoUrl,
          star_count: repoData.stargazers_count,
          name: repoData.name,
          description: repoData.description || '',
          fork_count: repoData.forks_count,
          watchers_count: repoData.watchers_count,
          created_at: repoData.created_at,
          updated_at: repoData.updated_at,
          pushed_at: repoData.pushed_at,
          topics: repoData.topics || [],
          aggregate_score: 0,
        };
        repo.aggregate_score = calculateAggregateScore(repo);

        // Update min and max values for all filters
        minStars = Math.min(minStars, repo.star_count);
        maxStars = Math.max(maxStars, repo.star_count);
        minForks = Math.min(minForks, repo.fork_count);
        maxForks = Math.max(maxForks, repo.fork_count);
        minWatchers = Math.min(minWatchers, repo.watchers_count);
        maxWatchers = Math.max(maxWatchers, repo.watchers_count);

        const updatedSinceDays = (new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        minUpdatedSinceDays = Math.min(minUpdatedSinceDays, updatedSinceDays);
        maxUpdatedSinceDays = Math.max(maxUpdatedSinceDays, updatedSinceDays);

        const createdSinceDays = (new Date().getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
        minCreatedSinceDays = Math.min(minCreatedSinceDays, createdSinceDays);
        maxCreatedSinceDays = Math.max(maxCreatedSinceDays, createdSinceDays);

        const pushedSinceDays = (new Date().getTime() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
        minPushedSinceDays = Math.min(minPushedSinceDays, pushedSinceDays);
        maxPushedSinceDays = Math.max(maxPushedSinceDays, pushedSinceDays);

        console.log(`Repository ${repoUrl} has ${repo.star_count} stars. (API call ${apiCallCount}/${maxApiCalls})`);
        repos.push(repo);
      } catch (error: any) {
        console.error(`Failed to fetch data for ${repoUrl}: ${error.message}`);
        apiCallCount++; // Count failed requests towards the limit
      }
    }

    // Sort repositories by aggregate score in descending order
    repos.sort((a, b) => b.aggregate_score - a.aggregate_score);

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



/* Example response
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