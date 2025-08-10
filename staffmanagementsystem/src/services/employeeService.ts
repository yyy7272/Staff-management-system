import { apiClient } from '../lib/apiClient';
import type { 
  Employee, 
  ApiResponse, 
  FilterOptions 
} from '../types/common';
import type { 
  EmployeeApi, 
  EmployeeCreateRequest, 
  EmployeeUpdateRequest 
} from '../types/api';

class EmployeeService implements EmployeeApi {
  private readonly endpoint = '/employees';

  async getAll(filters?: FilterOptions): Promise<ApiResponse<Employee[]>> {
    const data = await apiClient.getWithParams<Employee[]>(`${this.endpoint}`, filters);
    return { data, status: 'success' };
  }

  async getById(id: string): Promise<ApiResponse<Employee>> {
    const data = await apiClient.get<Employee>(`${this.endpoint}/${id}`);
    return { data, status: 'success' };
  }

  async create(data: EmployeeCreateRequest): Promise<ApiResponse<Employee>> {
    const result = await apiClient.post<Employee>(`${this.endpoint}`, data);
    return { data: result, status: 'success' };
  }

  async update(id: string, data: EmployeeUpdateRequest): Promise<ApiResponse<Employee>> {
    const result = await apiClient.put<Employee>(`${this.endpoint}/${id}`, data);
    return { data: result, status: 'success' };
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    await apiClient.delete<void>(`${this.endpoint}/${id}`);
    return { data: undefined, status: 'success' };
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    await apiClient.post<void>(`${this.endpoint}/bulk-delete`, { ids });
    return { data: undefined, status: 'success' };
  }

  async export(filters?: FilterOptions): Promise<Blob> {
    return apiClient.getBlob(`${this.endpoint}/export`);
  }

  async getStatistics(): Promise<ApiResponse<{
    total: number;
    active: number;
    onLeave: number;
    inactive: number;
  }>> {
    const data = await apiClient.get<{
      total: number;
      active: number;
      onLeave: number;
      inactive: number;
    }>(`${this.endpoint}/statistics`);
    return { data, status: 'success' };
  }
}

export const employeeService = new EmployeeService();