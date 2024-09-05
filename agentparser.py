import re
import aiohttp
import asyncio
import logging
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Step 1: Read the markdown file and extract GitHub links
def extract_github_links(markdown_file):
    logging.info(f"Reading markdown file: {markdown_file}")
    with open(markdown_file, 'r') as file:
        content = file.read()
    
    # Regex pattern to extract full GitHub links and hub.apw.app links
    github_links = re.findall(r'https://(github\.com|hub\.apw\.app)/[^\s)]+', content)
    logging.info(f"Extracted {len(github_links)} GitHub links from the markdown file.")
    
    return github_links

# Step 2: Get the actual GitHub repo URL from the redirect link
async def get_repo_url(session, link):
    logging.info(f"Fetching repo URL for link: {link}")
    try:
        async with session.get(link, allow_redirects=True) as response:
            final_url = str(response.url)
            if "github.com" in final_url:
                logging.info(f"Resolved GitHub repo URL: {final_url}")
                return final_url
            else:
                logging.warning(f"Resolved URL is not a GitHub repo: {final_url}")
    except Exception as e:
        logging.error(f"Error fetching repo URL for {link}: {e}")
    return None

# Step 3: Get star count for each GitHub repository
async def get_star_count(session, repo_url):
    logging.info(f"Fetching star count for repo: {repo_url}")
    try:
        async with session.get(repo_url) as response:
            if response.status == 200:
                html_content = await response.text()
                soup = BeautifulSoup(html_content, 'html.parser')
                star_element = soup.find('span', id='repo-stars-counter-star')
                if star_element:
                    star_count = star_element.get('title', '').replace(',', '')
                    if star_count.isdigit():
                        logging.info(f"Star count for {repo_url}: {star_count}")
                        return int(star_count)
                    else:
                        logging.warning(f"Invalid star count format for {repo_url}: {star_count}")
                else:
                    logging.warning(f"Star count element not found for {repo_url}")
            else:
                logging.warning(f"Failed to fetch star count for {repo_url}: Status code {response.status}")
    except Exception as e:
        logging.error(f"Error fetching star count for {repo_url}: {e}")
    return None

# Step 4: Process all links and store their star counts
async def fetch_star_data(github_links):
    logging.info("Starting to fetch star data for all GitHub links.")
    async with aiohttp.ClientSession() as session:
        tasks = []
        for link in github_links:
            task = asyncio.create_task(process_link(session, link))
            tasks.append(task)
        results = await asyncio.gather(*tasks)
    
    # Filter out None results and sort by star count
    results = [result for result in results if result is not None]
    results.sort(key=lambda x: x[1], reverse=True)
    
    logging.info(f"Fetched star data for {len(results)} repositories.")
    return results

# Helper function to process each link
async def process_link(session, link):
    logging.info(f"Processing link: {link}")
    repo_url = await get_repo_url(session, link)
    if repo_url:
        stars = await get_star_count(session, repo_url)
        if stars is not None:
            logging.info(f"Fetched {stars} stars for {repo_url}")
            return (repo_url, stars)
    logging.warning(f"Failed to process link: {link}")
    return None

# Step 5: Print the sorted repos with their star count
def print_sorted_repos(repo_stars):
    logging.info("Printing sorted repositories with their star counts.")
    for repo, stars in repo_stars:
        print(f"{repo}: {stars} stars")

# Main function to execute the steps
def main():
    markdown_file = '/Users/zebas/Developer/agent-repo-parser/Awesome-AI-Agents.md'
    logging.info(f"Starting main process with markdown file: {markdown_file}")
    
    # Add debug print
    print("Starting main process...")
    
    github_links = extract_github_links(markdown_file)
    
    logging.info(f"Extracted {len(github_links)} GitHub links from the markdown file.")
    
    # Add debug print
    print(f"Extracted {len(github_links)} GitHub links.")
    
    # Add a check to ensure we have links before proceeding
    if not github_links:
        print("No GitHub links found. Please check the markdown file.")
        return
    
    sorted_repos = asyncio.run(fetch_star_data(github_links))
    
    # Add debug print
    print(f"Fetched data for {len(sorted_repos)} repositories.")
    
    print_sorted_repos(sorted_repos)
    logging.info("Main process completed.")

if __name__ == "__main__":
    main()