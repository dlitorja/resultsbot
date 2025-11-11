/**
 * Mock job data for testing
 */

import { FormattedJob } from '../../src/services/jobs/types.js';

export const mockJobs: FormattedJob[] = [
  {
    id: 'job-1',
    title: 'Senior Game Designer',
    company: 'Epic Games',
    location: 'Remote',
    description: 'Join our team to create amazing gaming experiences...',
    url: 'https://example.com/job/1',
    salary: '$120,000 - $180,000',
    posted: new Date('2024-11-10'),
    priority: 'high',
    source: 'adzuna',
  },
  {
    id: 'job-2',
    title: 'Unity Developer',
    company: 'Indie Studio',
    location: 'San Francisco, CA',
    description: 'Build innovative indie games with Unity...',
    url: 'https://example.com/job/2',
    salary: '$80,000 - $120,000',
    posted: new Date('2024-11-09'),
    priority: 'medium',
    source: 'adzuna',
  },
  {
    id: 'job-3',
    title: 'Content Creator',
    company: 'YouTube Studios',
    location: 'Remote',
    description: 'Create engaging video content for gaming community...',
    url: 'https://example.com/job/3',
    salary: undefined,
    posted: new Date('2024-11-08'),
    priority: 'low',
    source: 'adzuna',
  },
];

export const mockAdzunaResponse = {
  count: 3,
  results: [
    {
      id: 'job-1',
      title: 'Senior Game Designer',
      company: {
        display_name: 'Epic Games',
      },
      location: {
        display_name: 'Remote',
      },
      description: '<p>Join our team to create amazing gaming experiences...</p>',
      redirect_url: 'https://example.com/job/1',
      salary_min: 120000,
      salary_max: 180000,
      salary_is_predicted: '0',
      created: '2024-11-10T00:00:00Z',
    },
    {
      id: 'job-2',
      title: 'Unity Developer',
      company: {
        display_name: 'Indie Studio',
      },
      location: {
        display_name: 'San Francisco, CA',
      },
      description: '<p>Build <strong>innovative</strong> indie games with Unity...</p>',
      redirect_url: 'https://example.com/job/2',
      salary_min: 80000,
      salary_max: 120000,
      salary_is_predicted: '0',
      created: '2024-11-09T00:00:00Z',
    },
  ],
};

