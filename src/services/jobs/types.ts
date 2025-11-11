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

export interface MuseJob {
  id: number;
  name: string;
  company: {
    name: string;
    id: number;
  };
  locations: Array<{
    name: string;
  }>;
  contents: string;
  refs: {
    landing_page: string;
  };
  publication_date: string;
  levels?: Array<{
    name: string;
    short_name: string;
  }>;
  categories?: Array<{
    name: string;
  }>;
}

export interface MuseResponse {
  results: MuseJob[];
  page_count: number;
  page: number;
  item_count: number;
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
  source: 'adzuna' | 'themuse';
}

export interface JobSearchCriteria {
  keywords: string[];
  location?: string;
  maxAge?: number; // days
  maxResults?: number;
}

