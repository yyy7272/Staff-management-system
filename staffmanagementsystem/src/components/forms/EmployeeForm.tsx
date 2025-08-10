import React from 'react';
import { FormDialog } from '../common';
import { useEntityForm } from '../../hooks';
import { EMPLOYEE_FORM_FIELDS } from '../../constants/formConfigs';
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from '../../types/api';
import type { FormErrors } from '../../types/common';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<EmployeeCreateRequest>;
  onSubmit: (data: EmployeeCreateRequest | EmployeeUpdateRequest) => Promise<{ success: boolean; errors?: FormErrors<EmployeeCreateRequest | EmployeeUpdateRequest> }>;
}

export function EmployeeForm({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
  onSubmit
}: EmployeeFormProps) {
  const {
    formData,
    formErrors,
    isSubmitting,
    handleFieldChange,
    resetForm,
    populateForm
  } = useEntityForm<EmployeeCreateRequest>({
    initialData: {
      name: "",
      email: "",
      position: "",
      department: "",
      hireDate: "",
      salary: 0,
      phone: "",
      address: "",
      ...initialData
    },
    onSubmit,
    onSuccess: () => {
      onSuccess();
      onClose();
      resetForm();
    }
  });

  React.useEffect(() => {
    if (isOpen && initialData && mode === 'edit') {
      populateForm(initialData);
    } else if (isOpen && mode === 'create') {
      resetForm();
    }
  }, [isOpen, mode, initialData, populateForm, resetForm]);

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async () => {
    const result = await onSubmit(formData);
    if (result.success) {
      onSuccess();
      handleClose();
    }
    return result;
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
      fields={EMPLOYEE_FORM_FIELDS}
      data={formData}
      errors={formErrors}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onFieldChange={handleFieldChange}
      submitLabel={mode === 'create' ? 'Add Employee' : 'Update Employee'}
    />
  );
}