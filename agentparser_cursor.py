import requests
from bs4 import BeautifulSoup
import re
import concurrent.futures

def fetch_star_count(repo_url):
    print(f"Fetching star count for {repo_url}")
    response = requests.get(repo_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    star_element = soup.find('span', id='repo-stars-counter-star')
    if star_element:
        star_count = star_element.get('title', '0').replace(',', '')
        return repo_url, int(star_count)
    return repo_url, 0

def main():
    markdown_url = "https://raw.githubusercontent.com/Jenqyang/Awesome-AI-Agents/main/README.md"
    print(f"Fetching markdown file from {markdown_url}")
    
    response = requests.get(markdown_url)
    github_links = re.findall(r'https://github\.com/[^/]+/[^/\s]+', response.text)
    
    print(f"Found {len(github_links)} GitHub repository links")

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_star_count, github_links))

    sorted_results = sorted(results, key=lambda x: x[1], reverse=True)

    print("\nRepositories sorted by star count:")
    for repo, stars in sorted_results:
        print(f"{repo}: {stars} stars")

if __name__ == "__main__":
    main()
