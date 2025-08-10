import { apiClient } from '../lib/apiClient';
import type { 
  Department, 
  ApiResponse 
} from '../types/common';
import type { 
  DepartmentApi, 
  DepartmentCreateRequest, 
  DepartmentUpdateRequest 
} from '../types/api';

class DepartmentService implements DepartmentApi {
  private readonly endpoint = '/departments';

  async getAll(): Promise<ApiResponse<Department[]>> {
    const data = await apiClient.get<Department[]>(`${this.endpoint}`);
    return { data, status: 'success' };
  }

  async getById(id: string): Promise<ApiResponse<Department>> {
    const data = await apiClient.get<Department>(`${this.endpoint}/${id}`);
    return { data, status: 'success' };
  }

  async create(data: DepartmentCreateRequest): Promise<ApiResponse<Department>> {
    const result = await apiClient.post<Department>(`${this.endpoint}`, data);
    return { data: result, status: 'success' };
  }

  async update(id: string, data: Partial<DepartmentUpdateRequest>): Promise<ApiResponse<Department>> {
    const result = await apiClient.put<Department>(`${this.endpoint}/${id}`, data);
    return { data: result, status: 'success' };
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    await apiClient.delete<void>(`${this.endpoint}/${id}`);
    return { data: undefined, status: 'success' };
  }

  async getStatistics(): Promise<ApiResponse<{
    totalDepts: number;
    parentDepts: number;
    childDepts: number;
    totalEmployees: number;
  }>> {
    const data = await apiClient.get<{
      totalDepts: number;
      parentDepts: number;
      childDepts: number;
      totalEmployees: number;
    }>(`${this.endpoint}/statistics`);
    return { data, status: 'success' };
  }
}

export const departmentService = new DepartmentService();