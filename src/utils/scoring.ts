import { Repo } from '../types/repo';

export function calculateAggregateScore(repo: Repo): number {
  const now = new Date().getTime();
  const createdDate = new Date(repo.created_at).getTime();
  const updatedDate = new Date(repo.updated_at).getTime();
  
  const ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
  const daysSinceUpdate = (now - updatedDate) / (1000 * 60 * 60 * 24);
  
  const starScore = repo.star_count * 0.25;
  const forkScore = repo.fork_count * 0.20;
  const watchersScore = repo.watchers_count * 0.15;
  const ageScore = Math.min(ageInDays / 365, 5) * 2;
  const updateScore = Math.max(0, 15 - daysSinceUpdate / 30);
  const topicScore = Math.min(repo.topics.length, 5) * 3;

  return starScore + forkScore + watchersScore + ageScore + updateScore + topicScore;
} 