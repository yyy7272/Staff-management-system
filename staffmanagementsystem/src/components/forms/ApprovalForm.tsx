import React from 'react';
import { FormDialog } from '../common';
import { useEntityForm } from '../../hooks';
import { APPROVAL_FORM_FIELDS } from '../../constants/formConfigs';
import type { ApprovalCreateRequest } from '../../types/api';
import type { FormErrors } from '../../types/common';

interface ApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<ApprovalCreateRequest>;
  onSubmit: (data: ApprovalCreateRequest) => Promise<{ success: boolean; errors?: FormErrors<ApprovalCreateRequest> }>;
}

export function ApprovalForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onSubmit
}: ApprovalFormProps) {
  const {
    formData,
    formErrors,
    isSubmitting,
    handleFieldChange,
    resetForm,
    populateForm
  } = useEntityForm<ApprovalCreateRequest>({
    initialData: {
      title: "",
      type: "leave",
      description: "",
      priority: "medium",
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
    if (isOpen && initialData) {
      populateForm(initialData);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, initialData, populateForm, resetForm]);

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
      title="Create New Request"
      fields={APPROVAL_FORM_FIELDS}
      data={formData}
      errors={formErrors}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onFieldChange={handleFieldChange}
      submitLabel="Submit Request"
    />
  );
}