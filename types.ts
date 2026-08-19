// FIX: Populated with type definitions used across the application.
export interface UserBase {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN';
}

export interface Student extends UserBase {
  role: 'STUDENT';
  profileImage: string;
  careerGoals: string;
  skills: string[];
  qualifications: string[];
  locationPreference: string;
  // New preference fields
  preferredCompanySize: 'Startup' | 'Mid-size' | 'MNC' | 'Any';
  industryFocus: string[];
  preferredDuration: '3 Months' | '6 Months' | 'Any';
  // New diversity fields
  gender: 'Male' | 'Female' | 'Other';
  background: 'Urban' | 'Rural';
  collegeTier: 'Tier-1' | 'Tier-2' | 'Tier-3';
}

export interface Company extends UserBase {
  role: 'COMPANY';
}

export interface Admin extends UserBase {
  role: 'ADMIN';
}

export type User = Student | Company | Admin;

export interface Notification {
  id: number;
  userType: 'student' | 'company' | 'admin';
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
}

export interface Internship {
  id: number;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  sector: string;
  deadline: string;
  seats: number;
  duration: string;
  // New field for matching
  companySize: 'Startup' | 'Mid-size' | 'MNC';
  stipend?: string;
  applicants?: number[];
}

export interface Course {
    id: number;
    title: string;
    provider: string;
    coversSkills: string[];
}

export type NotificationTriggerEvent =
  | { type: 'welcome' }
  | { type: 'course_completion'; courseName: string; improvedInternship: string }
  | { type: 'project_completion'; projectName: string; score: number; nextProject: string }
  // New notification types
  | { type: 'new_match'; internshipName: string; matchScore: number }
  | { type: 'deadline_reminder'; internshipName: string; daysLeft: number }
  | { type: 'score_improvement'; internshipName: string; improvement: number; reason: string };

// Types for AI Mock Interview Feature
export interface InterviewQuestion {
    id: number;
    text: string;
}

export interface InterviewFeedback {
    type: 'tone' | 'pace' | 'bodyLanguage' | 'keywords';
    value: string;
    timestamp: number;
}

export interface InterviewReport {
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    detailedFeedback: {
        clarity: string;
        confidence: string;
        bodyLanguage: string;
        keywordUsage: string;
    };
}

// Types for AI-Driven Integrations
export interface ProjectItem {
    title: string;
    description: string;
    technologies: string[];
}

export interface EducationItem {
    degree: string;
    institution: string;
    yearOrGrade?: string;
}

export interface ResumeAnalysisResult {
    name?: string;
    email?: string;
    phone?: string;
    summaryBio: string;
    skills: string[];
    projects: ProjectItem[];
    certifications: string[];
    education: EducationItem[];
    strengths: string[];
    improvementSuggestions: string[];
}

export interface MissingSkillDetail {
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
    estimatedTimeToLearn: string;
}

export interface SkillGapResult {
    matchPercentage: number;
    possessedSkills: string[];
    missingSkills: MissingSkillDetail[];
    recommendationSummary: string;
}

export interface CourseSuggestion {
    title: string;
    provider: string;
    duration: string;
    level: string;
    skillsCovered: string[];
}

export interface ProjectSuggestion {
    title: string;
    description: string;
    techStack: string[];
    portfolioValue: string;
}

export interface CertificationSuggestion {
    name: string;
    issuingOrg: string;
    recognition: string;
}

export interface LearningRoadmapPhase {
    phaseNumber: number;
    phaseTitle: string;
    duration: string;
    goals: string[];
    courses: CourseSuggestion[];
    projects: ProjectSuggestion[];
    certifications: CertificationSuggestion[];
}

export interface LearningRoadmap {
    studentName: string;
    careerGoal: string;
    totalDurationWeeks: number;
    phases: LearningRoadmapPhase[];
    keyTakeaway: string;
}