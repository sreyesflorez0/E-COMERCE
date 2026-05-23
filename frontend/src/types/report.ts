export interface ReportDetailItem {
  id?: string;
  report_id?: string;
  metric: string;
  value: number;
  description: string;
}

export interface AdminReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'on_demand';
  status: 'generated' | 'failed' | 'pending';
  start_date: string;
  end_date: string;
  generated_by?: string;
  created_at: string;
  report_details?: ReportDetailItem[];
}

export interface GenerateReportRequest {
  report_type: 'daily' | 'weekly' | 'on_demand';
  start_date: string;
  end_date: string;
}

export interface ListReportsResponse {
  message: string;
  count: number;
  limit: number;
  offset: number;
  reports: AdminReport[];
}

export interface SingleReportResponse {
  message: string;
  report: AdminReport;
}
