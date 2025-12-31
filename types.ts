
export enum AppView {
  STRATEGY = 'STRATEGY',
  GENERATOR = 'GENERATOR',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  SCRAPER = 'SCRAPER'
}

export type ApplicationType = 'alternance' | 'stage';

export interface JobMethod {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
  recommended?: boolean;
}

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  snippet: string;
  source: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; 
  endDate: string; 
  isCurrent: boolean;
  description: string;
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface MasterProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  bio: string;
  availability: string;
  skills: string;
  languages: string;
  interests: string;
  certifications: Certification[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
}

export interface ApplicationPackage {
  matchScore: number;
  missingSkills: string[];
  extractedJobTitle: string;
  extractedCompany: string;
  optimizedProfile: MasterProfile;
  coverLetter: string;
  analysis: string;
}
