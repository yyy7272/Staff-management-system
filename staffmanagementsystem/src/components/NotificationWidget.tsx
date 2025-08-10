import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function NotificationWidget() {
  const notifications = [
    {
      id: 1,
      type: "approval",
      title: "Leave Request Pending",
      description: "John Doe's vacation request needs approval",
      time: "10 minutes ago",
      priority: "high"
    },
    {
      id: 2,
      type: "info",
      title: "Payroll Processing",
      description: "Monthly payroll will be processed tomorrow",
      time: "2 hours ago",
      priority: "medium"
    },
    {
      id: 3,
      type: "success",
      title: "Employee Onboarding",
      description: "New employee training completed successfully",
      time: "1 day ago",
      priority: "low"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
            {getIcon(notification.type)}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                {getPriorityBadge(notification.priority)}
              </div>
              <p className="text-xs text-muted-foreground">{notification.description}</p>
              <p className="text-xs text-muted-foreground">{notification.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}