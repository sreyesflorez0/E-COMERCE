import { api } from '@/lib/api';
import { AdminReport, GenerateReportRequest, ListReportsResponse, SingleReportResponse } from '@/types/report';

export const reportService = {
  async getReports(limit: number = 50, offset: number = 0, report_type?: string): Promise<ListReportsResponse> {
    let url = `/reports?limit=${limit}&offset=${offset}`;
    if (report_type) {
      url += `&report_type=${report_type}`;
    }
    const response = await api.get<ListReportsResponse>(url);
    return response.data;
  },

  async getReportById(id: string): Promise<AdminReport> {
    const response = await api.get<SingleReportResponse>(`/reports/${id}`);
    return response.data.report;
  },

  async generateReport(data: GenerateReportRequest): Promise<AdminReport> {
    const response = await api.post<{message: string, report: AdminReport}>('/reports/generate', data);
    return response.data.report;
  },

  async generateDailyReport(): Promise<AdminReport> {
    const response = await api.post<{message: string, report: AdminReport}>('/reports/daily');
    return response.data.report;
  }
};
