import { HomePage } from "./pages/HomePage";
import { OrganizationPage } from "./pages/OrganizationPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { PermissionsPage } from "./pages/PermissionsPage";
import { ApprovalPage } from "./pages/ApprovalPage";


interface MainContentProps {
  activeMenu: string;
}

export function MainContent({ activeMenu }: MainContentProps) {
  const contentMap = {
    home: <HomePage />,
    organization: <OrganizationPage />,
    employees: <EmployeesPage />,
    permissions: <PermissionsPage />,
    approval: <ApprovalPage />,
  };

  return contentMap[activeMenu as keyof typeof contentMap] || <HomePage />;
}