import axios from 'axios';
import { Repo } from './types/repo';
import { fetchRepoData } from './services/github-service';
import { 
  extractGitHubRepoUrls, 
  initializeMinMax, 
  readUrlsFromFile, 
  generateMarkdownTable 
} from './utils/helpers';

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

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('Error: GitHub token not found in environment variables.');
      console.error('Please set your GitHub token in the GITHUB_TOKEN environment variable.');
      return;
    }

    for (const repoUrl of githubRepoUrls) {
      if (apiCallCount >= maxApiCalls) {
        console.log(`Reached maximum API call limit (${maxApiCalls}). Stopping.`);
        break;
      }

      console.log(`Fetching data for ${repoUrl}...`);
      const repo = await fetchRepoData(repoUrl, githubToken);
      
      if (repo) {
        apiCallCount++;
        console.log(`Repository ${repoUrl} has ${repo.star_count} stars. (API call ${apiCallCount}/${maxApiCalls})`);
        repos.push(repo);
      }
    }

    repos.sort((a, b) => b.aggregate_score - a.aggregate_score);

    const markdownTable = generateMarkdownTable(repos);
    console.log(markdownTable);

    console.log('\nRepositories sorted by aggregate score:');
    repos.forEach((repo) => {
      console.log(`${repo.url} - Aggregate Score: ${repo.aggregate_score.toFixed(2)}, ⭐ ${repo.star_count} stars`);
    });

  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}

main(); 