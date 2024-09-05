import requests
from bs4 import BeautifulSoup
import re
import time

def fetch_markdown_file(url):
    """Fetches the markdown file from the provided URL."""
    print(f"Fetching markdown file from {url}...")
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch markdown file. Status code: {response.status_code}")
        return None
    print("Markdown file fetched successfully.")
    return response.text

def extract_github_repos(markdown_text):
    """Extracts GitHub repository links from the markdown text."""
    print("Extracting GitHub repository links...")
    # Use regular expression to find GitHub repository links
    repo_links = re.findall(r"https://github\.com/[^\s]+", markdown_text)
    print(f"Found {len(repo_links)} GitHub repository links.")
    return repo_links

def fetch_star_count(repo_link):
    """Fetches the star count for a GitHub repository."""
    print(f"Fetching star count for {repo_link}...")
    response = requests.get(repo_link)
    if response.status_code != 200:
        print(f"Failed to fetch star count. Status code: {response.status_code}")
        return None
    soup = BeautifulSoup(response.text, 'html.parser')
    star_count_span = soup.find('span', id="repo-stars-counter-star")
    if star_count_span:
        star_count = star_count_span['title'].replace(',', '')
        print(f"Star count for {repo_link}: {star_count}")
        return int(star_count)
    else:
        print(f"Failed to find star count for {repo_link}")
        return None

def main():
    url = input("Enter the URL of the markdown file: ")
    time.sleep(5)
    markdown_text = fetch_markdown_file(url)
    if markdown_text is None:
        return

    repo_links = extract_github_repos(markdown_text)
    if not repo_links:
        return

    repo_star_counts = {}
    for repo_link in repo_links:
        star_count = fetch_star_count(repo_link)
        if star_count is not None:
            repo_star_counts[repo_link] = star_count

    sorted_repos = sorted(repo_star_counts.items(), key=lambda x: x[1], reverse=True)
    print("\nRepositories sorted by star count:")
    for repo_link, star_count in sorted_repos:
        print(f"{repo_link}: {star_count}")

if __name__ == "__main__":
    main()