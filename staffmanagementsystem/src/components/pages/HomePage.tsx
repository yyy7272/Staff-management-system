import { Users, Building2, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatisticsCards } from "../common";
import type { StatisticCardData } from "../../types/common";
import "tailwindcss";

export function HomePage() {
  const statisticsData: StatisticCardData[] = [
    {
      label: "Total Employees",
      value: 245,
      icon: Users,
      trend: { value: "+12% from last month", isPositive: true }
    },
    {
      label: "Departments",
      value: 12,
      icon: Building2,
      trend: { value: "+2 new departments", isPositive: true }
    },
    {
      label: "Pending Approvals",
      value: 23,
      icon: FileText,
      trend: { value: "-8% from last week", isPositive: false }
    },
    {
      label: "Monthly Growth",
      value: "+8.2%",
      icon: TrendingUp,
      trend: { value: "Employee satisfaction", isPositive: true }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the Employee Management System</p>
      </div>

      <StatisticsCards statistics={statisticsData} className="gap-6" />

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New employee onboarding</p>
                <p className="text-xs text-muted-foreground">Sarah Johnson joined Marketing Dept</p>
              </div>
              <div className="text-xs text-muted-foreground">2 hours ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Leave request approved</p>
                <p className="text-xs text-muted-foreground">Mike Chen's vacation request approved</p>
              </div>
              <div className="text-xs text-muted-foreground">4 hours ago</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Department restructure</p>
                <p className="text-xs text-muted-foreground">IT Department organizational changes</p>
              </div>
              <div className="text-xs text-muted-foreground">1 day ago</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Process Approvals
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Departments
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}