"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
function calculateAggregateScore(repo) {
    var now = new Date().getTime();
    var createdDate = new Date(repo.created_at).getTime();
    var updatedDate = new Date(repo.updated_at).getTime();
    var ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    var daysSinceUpdate = (now - updatedDate) / (1000 * 60 * 60 * 24);
    var starScore = repo.star_count * 0.25;
    var forkScore = repo.fork_count * 0.20;
    var watchersScore = repo.watchers_count * 0.15;
    var ageScore = Math.min(ageInDays / 365, 5) * 2; // Max 10 points for 5 years or older
    var updateScore = Math.max(0, 15 - daysSinceUpdate / 30); // Max 15 points, decreasing by 1 point per month
    // TODO: topicScore should be based on specific topics
    var topicScore = Math.min(repo.topics.length, 5) * 3; // 3 points per topic, up to 5 topics (15 points max)
    return starScore + forkScore + watchersScore + ageScore + updateScore + topicScore;
}
// Fetch raw repository data from GitHub API
function fetchRepoRawData(repoUrl, githubToken) {
    return __awaiter(this, void 0, void 0, function () {
        var repoPath, apiUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repoPath = repoUrl.replace('https://github.com/', '');
                    apiUrl = "https://api.github.com/repos/".concat(repoPath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, {
                            headers: {
                                'User-Agent': 'request',
                                'Authorization': "token ".concat(githubToken),
                                'Accept': 'application/vnd.github.mercy-preview+json', // Required to fetch topics
                            },
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to fetch data for ".concat(repoUrl, ": ").concat(error_1.message));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Transform raw repository data into Repo interface
function transformRepoData(rawData, repoUrl) {
    var repo = {
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
function fetchRepoData(repoUrl, githubToken) {
    return __awaiter(this, void 0, void 0, function () {
        var rawData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchRepoRawData(repoUrl, githubToken)];
                case 1:
                    rawData = _a.sent();
                    if (rawData) {
                        return [2 /*return*/, transformRepoData(rawData, repoUrl)];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
// Update min and max values based on repository data
function updateMinMaxValues(repo, minMax) {
    minMax.minStars = Math.min(minMax.minStars, repo.star_count);
    minMax.maxStars = Math.max(minMax.maxStars, repo.star_count);
    minMax.minForks = Math.min(minMax.minForks, repo.fork_count);
    minMax.maxForks = Math.max(minMax.maxForks, repo.fork_count);
    minMax.minWatchers = Math.min(minMax.minWatchers, repo.watchers_count);
    minMax.maxWatchers = Math.max(minMax.maxWatchers, repo.watchers_count);
    var updatedSinceDays = (new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    minMax.minUpdatedSinceDays = Math.min(minMax.minUpdatedSinceDays, updatedSinceDays);
    minMax.maxUpdatedSinceDays = Math.max(minMax.maxUpdatedSinceDays, updatedSinceDays);
    var createdSinceDays = (new Date().getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
    minMax.minCreatedSinceDays = Math.min(minMax.minCreatedSinceDays, createdSinceDays);
    minMax.maxCreatedSinceDays = Math.max(minMax.maxCreatedSinceDays, createdSinceDays);
    var pushedSinceDays = (new Date().getTime() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
    minMax.minPushedSinceDays = Math.min(minMax.minPushedSinceDays, pushedSinceDays);
    minMax.maxPushedSinceDays = Math.max(minMax.maxPushedSinceDays, pushedSinceDays);
}
// Extract GitHub repository URLs from content
function extractGitHubRepoUrls(content) {
    var githubRepoUrls = new Set();
    var repoUrlRegex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;
    var matches = content.match(repoUrlRegex);
    if (matches) {
        matches.forEach(function (url) { return githubRepoUrls.add(url); });
    }
    return githubRepoUrls;
}
// Initialize min and max values
function initializeMinMax() {
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
function readUrlsFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promises_1.default.readFile(filePath, 'utf-8')];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, content.split('\n').filter(function (url) { return url.trim() !== ''; })];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error reading file ".concat(filePath, ": ").concat(error_2.message));
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// New function to generate markdown table
function generateMarkdownTable(repos) {
    // Create markdown table header
    var markdownTable = "| Repository | Stars | Forks | Watchers | Created | Last Updated | Topics | Aggregate Score |\n";
    markdownTable += "|------------|-------|-------|----------|---------|--------------|--------|------------------|\n";
    // Add each repository to the markdown table
    repos.forEach(function (repo) {
        var createdDate = new Date(repo.created_at).toISOString().split('T')[0];
        var updatedDate = new Date(repo.updated_at).toISOString().split('T')[0];
        var topicsString = repo.topics.slice(0, 3).join(', '); // Limit to first 3 topics
        markdownTable += "| [".concat(repo.name, "](").concat(repo.url, ") | ").concat(repo.star_count, " | ").concat(repo.fork_count, " | ").concat(repo.watchers_count, " | ").concat(createdDate, " | ").concat(updatedDate, " | ").concat(topicsString, " | ").concat(repo.aggregate_score.toFixed(2), " |\n");
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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var urlFilePath, urls, githubRepoUrls_2, _i, urls_1, url, response, content, extractedUrls, repos, apiCallCount, maxApiCalls, minMax, githubToken, _a, githubRepoUrls_1, repoUrl, repo, markdownTable, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    urlFilePath = process.argv[2];
                    if (!urlFilePath) {
                        console.error('Please provide a path to the URL file as a command-line argument.');
                        return [2 /*return*/];
                    }
                    console.log("Reading URLs from ".concat(urlFilePath, "..."));
                    return [4 /*yield*/, readUrlsFromFile(urlFilePath)];
                case 1:
                    urls = _b.sent();
                    console.log("Found ".concat(urls.length, " URLs in the file."));
                    githubRepoUrls_2 = new Set();
                    _i = 0, urls_1 = urls;
                    _b.label = 2;
                case 2:
                    if (!(_i < urls_1.length)) return [3 /*break*/, 5];
                    url = urls_1[_i];
                    console.log("Fetching content from ".concat(url, "..."));
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 3:
                    response = _b.sent();
                    content = response.data;
                    extractedUrls = extractGitHubRepoUrls(content);
                    extractedUrls.forEach(function (repoUrl) { return githubRepoUrls_2.add(repoUrl); });
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Found ".concat(githubRepoUrls_2.size, " unique GitHub repositories."));
                    repos = [];
                    apiCallCount = 0;
                    maxApiCalls = 5;
                    minMax = initializeMinMax();
                    githubToken = process.env.GITHUB_TOKEN;
                    if (!githubToken) {
                        console.error('Error: GitHub token not found in environment variables.');
                        console.error('Please set your GitHub token in the GITHUB_TOKEN environment variable.');
                        return [2 /*return*/];
                    }
                    _a = 0, githubRepoUrls_1 = githubRepoUrls_2;
                    _b.label = 6;
                case 6:
                    if (!(_a < githubRepoUrls_1.length)) return [3 /*break*/, 9];
                    repoUrl = githubRepoUrls_1[_a];
                    if (apiCallCount >= maxApiCalls) {
                        console.log("Reached maximum API call limit (".concat(maxApiCalls, "). Stopping."));
                        return [3 /*break*/, 9];
                    }
                    console.log("Fetching data for ".concat(repoUrl, "..."));
                    return [4 /*yield*/, fetchRepoData(repoUrl, githubToken)];
                case 7:
                    repo = _b.sent();
                    if (repo) {
                        apiCallCount++;
                        updateMinMaxValues(repo, minMax);
                        console.log("Repository ".concat(repoUrl, " has ").concat(repo.star_count, " stars. (API call ").concat(apiCallCount, "/").concat(maxApiCalls, ")"));
                        repos.push(repo);
                    }
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    // Sort repositories by aggregate score in descending order
                    repos.sort(function (a, b) { return b.aggregate_score - a.aggregate_score; });
                    markdownTable = generateMarkdownTable(repos);
                    console.log(markdownTable);
                    console.log('\nRepositories sorted by aggregate score:');
                    repos.forEach(function (repo) {
                        console.log("".concat(repo.url, " - Aggregate Score: ").concat(repo.aggregate_score.toFixed(2), ", \u2B50 ").concat(repo.star_count, " stars"));
                    });
                    console.log(repos);
                    return [3 /*break*/, 11];
                case 10:
                    error_3 = _b.sent();
                    console.error("An error occurred: ".concat(error_3.message));
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
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
