export interface Repo {
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

export interface MinMaxValues {
  minStars: number;
  maxStars: number;
  minForks: number;
  maxForks: number;
  minWatchers: number;
  maxWatchers: number;
  minUpdatedSinceDays: number;
  maxUpdatedSinceDays: number;
  minCreatedSinceDays: number;
  maxCreatedSinceDays: number;
  minPushedSinceDays: number;
  maxPushedSinceDays: number;
} 