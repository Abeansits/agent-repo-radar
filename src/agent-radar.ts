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

interface CliArgs {
  urlFile: string;
  format: 'markdown' | 'html';
  maxCalls: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsedArgs: CliArgs = {
    urlFile: '',
    format: 'markdown',
    maxCalls: 5
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--url-file':
      case '-f':
        parsedArgs.urlFile = args[++i];
        break;
      case '--format':
      case '-o':
        const format = args[++i]?.toLowerCase();
        if (format !== 'markdown' && format !== 'html') {
          throw new Error('Invalid output format. Please use either "markdown" or "html".');
        }
        parsedArgs.format = format;
        break;
      case '--max-calls':
      case '-m':
        const maxCalls = parseInt(args[++i]);
        if (isNaN(maxCalls) || maxCalls <= 0) {
          throw new Error('max-calls must be a positive number.');
        }
        parsedArgs.maxCalls = maxCalls;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!parsedArgs.urlFile) {
    throw new Error(
      'Please provide the required parameters:\n' +
      'Usage: ts-node src/agent-radar.ts --url-file <path> [--format markdown|html] [--max-calls <number>]\n' +
      '  --url-file, -f    : Path to the file containing URLs\n' +
      '  --format, -o      : Output format "markdown" or "html" (default: markdown)\n' +
      '  --max-calls, -m   : Maximum number of GitHub API calls (default: 5)'
    );
  }

  return parsedArgs;
}

async function main() {
  console.log(`
    ╭─────────────────────────────────────╮
    │                                     │
    │      🎯 AI Agent Repo Radar         │
    │                                     │
    │      Scanning the AI landscape      │
    │      for remarkable repos...        │
    │                                     │
    ╰─────────────────────────────────────╯
  `);
  console.log('\nInitializing scan...\n');

  try {
    const args = parseArgs();
    
    console.log(`Reading URLs from ${args.urlFile}...`);
    console.log(`Maximum API calls set to: ${args.maxCalls}`);
    const urls = await readUrlsFromFile(args.urlFile);
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
      if (apiCallCount >= args.maxCalls) {
        console.log(`Reached maximum API call limit (${args.maxCalls}). Stopping.`);
        break;
      }

      console.log(`Fetching data for ${repoUrl}...`);
      apiCallCount++;
      const repo = await fetchRepoData(repoUrl, githubToken);
      
      if (repo) {
        console.log(`Repository ${repoUrl} has ${repo.star_count} stars. (API call ${apiCallCount}/${args.maxCalls})`);
        repos.push(repo);
      }
    }

    repos.sort((a, b) => b.aggregate_score - a.aggregate_score);

    if (args.format === 'markdown') {
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
