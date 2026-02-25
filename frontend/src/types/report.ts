export type ReportStatus = 'draft' | 'pending' | 'approved' | 'archived';
export type ReportType = 'financial' | 'audit' | 'operational' | 'compliance' | 'monthly' | 'annual';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  author: string;
  authorInitials: string;
  createdDate: string;
  period: string;
  status: ReportStatus;
  size: string;
  downloads: number;
}

export interface CreateReportPayload {
  title: string;
  type: ReportType;
  period: string;
  description: string;
  includeSections: string[];
  biometricValidated: boolean;
  adminPassword: string;
}
