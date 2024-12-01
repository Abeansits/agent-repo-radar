import axios from 'axios';
import { Repo } from './types/repo';
import { fetchRepoData } from './services/github-service';
import { 
  extractGitHubRepoUrls, 
  initializeMinMax, 
  readUrlsFromFile, 
  generateMarkdownTable,
  generateHtmlTable
} from './utils/helpers';
import * as fs from 'fs/promises';

async function main() {
  try {
    const urlFilePath = process.argv[2];
    const outputFormat = process.argv[3]?.toLowerCase() || 'markdown';
    const maxApiCalls = parseInt(process.argv[4]) || 5;

    if (!urlFilePath) {
      console.error('Please provide the required parameters:');
      console.error('Usage: ts-node src/agent_parser.ts <url-file-path> [output-format] [max-api-calls]');
      console.error('  - url-file-path: Path to the file containing URLs');
      console.error('  - output-format: "markdown" or "html" (default: markdown)');
      console.error('  - max-api-calls: Maximum number of GitHub API calls (default: 5)');
      return;
    }

    if (outputFormat !== 'markdown' && outputFormat !== 'html') {
      console.error('Invalid output format. Please use either "markdown" or "html".');
      return;
    }

    if (maxApiCalls <= 0) {
      console.error('max-api-calls must be a positive number.');
      return;
    }

    console.log(`Reading URLs from ${urlFilePath}...`);
    console.log(`Maximum API calls set to: ${maxApiCalls}`);
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
      apiCallCount++;
      const repo = await fetchRepoData(repoUrl, githubToken);
      
      if (repo) {
        console.log(`Repository ${repoUrl} has ${repo.star_count} stars. (API call ${apiCallCount}/${maxApiCalls})`);
        repos.push(repo);
      }
    }

    repos.sort((a, b) => b.aggregate_score - a.aggregate_score);

    if (outputFormat === 'markdown') {
      // Generate and log markdown table
      const markdownTable = generateMarkdownTable(repos);
      console.log(markdownTable);
    } else {
      // Generate and save HTML output
      const htmlContent = generateHtmlTable(repos);
      const outputFile = 'repository-analysis.html';
      await fs.writeFile(outputFile, htmlContent);
      console.log(`\nHTML report has been generated as ${outputFile}`);
    }

    console.log('\nRepositories sorted by aggregate score:');
    repos.forEach((repo) => {
      console.log(`${repo.url} - Aggregate Score: ${repo.aggregate_score.toFixed(2)}, ⭐ ${repo.star_count} stars`);
    });

  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}

main(); 