# Agent Repository Radar

A tool that aggregates and analyzes GitHub repositories from multiple sources including "awesome" lists, helping you discover and evaluate AI-agent-related projects based on quantitative metrics.

## Background

With the rapid pace of AI development, it's becoming increasingly challenging to keep track of all the valuable repositories and projects. This tool helps cut through the noise by analyzing repositories and ranking them based on meaningful metrics.

## How It Works

1. Reads URLs of "awesome" lists from a provided file
2. Extracts GitHub repository URLs from these lists
3. Fetches detailed information about each repository using the GitHub API
4. Calculates an aggregate score for each repository
5. Generates a sorted output in either markdown or HTML format

## Scoring Algorithm

The aggregate score for each repository is calculated using the following weighted metrics:

- Stars (25%): Number of repository stars × 0.25
- Forks (20%): Number of forks × 0.20
- Watchers (15%): Number of watchers × 0.15
- Repository Age: Min(age in years, 5) × 2
- Recent Activity: Max(0, 15 - months since last update)
- Topic Coverage: Min(number of topics, 5) × 3

This scoring system aims to balance popularity (stars, forks, watchers) with project maturity (age) and maintenance status (recent updates).

## Usage

In case you want to run the tool locally or somewhere else, you can do so by following these steps:

1. Set your GitHub API token:

```bash
export GITHUB_TOKEN=your_token_here
```

2. Create a file with URLs to awesome lists:

```bash
echo "https://raw.githubusercontent.com/user/repo/main/awesome-list.md" > sources.txt
```

3. Run the analyzer:

```bash
# Basic usage (defaults to markdown output and 5 API calls)
ts-node src/agent-radar.ts sources.txt

# Specify output format (markdown or html)
ts-node src/agent-radar.ts sources.txt html

# Specify output format and max API calls
ts-node src/agent-radar.ts sources.txt markdown 10
ts-node src/agent-radar.ts sources.txt html 15
```

### Parameters

- `<url-file-path>`: Path to the file containing URLs (required)
- `[output-format]`: Output format, either "markdown" or "html" (default: markdown)
- `[max-api-calls]`: Maximum number of GitHub API calls to make (default: 5)

## Output

The tool generates either:
- A markdown table in the console output, or
- An HTML file (`repository-analysis.html`) with a styled table

Both formats include:
- Repository name and link
- Star count
- Fork count
- Watcher count
- Creation date
- Last update date
- Top 3 topics
- Aggregate score

## Requirements

- Node.js
- TypeScript
- GitHub API token with `public_repo` access
- `axios` for HTTP requests

## Contributing

We welcome contributions! The easiest way to contribute is to add new "awesome" lists to our analysis:

1. Fork this repository
2. Add new awesome list URLs to `sources.txt`
3. Submit a pull request

Currently analyzed sources can be found in [`sources.txt`](./sources.txt).

Please ensure any added lists:
- Are focused on AI/ML agents or related technologies
- Are actively maintained
- Contain primarily GitHub repositories

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
