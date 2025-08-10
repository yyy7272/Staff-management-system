import { apiClient } from '../lib/apiClient';
import type { 
  ApprovalItem, 
  ApiResponse, 
  FilterOptions 
} from '../types/common';
import type { 
  ApprovalApi, 
  ApprovalCreateRequest, 
  ApprovalActionRequest 
} from '../types/api';

class ApprovalService implements ApprovalApi {
  private readonly endpoint = '/approvals';

  async getAll(filters?: FilterOptions): Promise<ApiResponse<ApprovalItem[]>> {
    const data = await apiClient.getWithParams<ApprovalItem[]>(`${this.endpoint}`, filters);
    return { data, status: 'success' };
  }

  async getById(id: string): Promise<ApiResponse<ApprovalItem>> {
    const data = await apiClient.get<ApprovalItem>(`${this.endpoint}/${id}`);
    return { data, status: 'success' };
  }

  async create(data: ApprovalCreateRequest): Promise<ApiResponse<ApprovalItem>> {
    const result = await apiClient.post<ApprovalItem>(`${this.endpoint}`, data);
    return { data: result, status: 'success' };
  }

  async processAction(id: string, data: ApprovalActionRequest): Promise<ApiResponse<ApprovalItem>> {
    const result = await apiClient.post<ApprovalItem>(`${this.endpoint}/${id}/action`, data);
    return { data: result, status: 'success' };
  }

  async cancel(id: string): Promise<ApiResponse<ApprovalItem>> {
    const result = await apiClient.post<ApprovalItem>(`${this.endpoint}/${id}/cancel`);
    return { data: result, status: 'success' };
  }

  async getStatistics(): Promise<ApiResponse<{
    pending: number;
    approved: number;
    rejected: number;
    myTotal: number;
  }>> {
    const data = await apiClient.get<{
      pending: number;
      approved: number;
      rejected: number;
      myTotal: number;
    }>(`${this.endpoint}/statistics`);
    return { data, status: 'success' };
  }

  async getPending(): Promise<ApiResponse<ApprovalItem[]>> {
    const data = await apiClient.get<ApprovalItem[]>(`${this.endpoint}/pending`);
    return { data, status: 'success' };
  }

  async getMyApprovals(): Promise<ApiResponse<ApprovalItem[]>> {
    const data = await apiClient.get<ApprovalItem[]>(`${this.endpoint}/my-approvals`);
    return { data, status: 'success' };
  }
}

export const approvalService = new ApprovalService();