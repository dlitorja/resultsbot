/**
 * Job posting types and interfaces
 */

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  category?: {
    label: string;
    tag: string;
  };
  contract_time?: string;
  contract_type?: string;
}

export interface AdzunaResponse {
  count: number;
  results: AdzunaJob[];
  mean?: number;
}

export interface FormattedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  posted: Date;
  priority: 'high' | 'medium' | 'low';
  source: 'adzuna' | 'creatorjobs';
}

export interface JobSearchCriteria {
  keywords: string[];
  location?: string;
  maxAge?: number; // days
  maxResults?: number;
}

