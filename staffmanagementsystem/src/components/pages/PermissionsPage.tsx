import { useState, useMemo } from "react";
import { Plus, Shield, Users, Settings, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import "tailwindcss";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: "active" | "inactive";
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  type: "read" | "write" | "delete" | "admin";
  enabled: boolean;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const initialRoles: Role[] = [
  {
    id: "1",
    name: "System Administrator",
    description: "Full system access and control",
    userCount: 2,
    permissions: ["user.read", "user.write", "user.delete", "role.admin", "dept.admin"],
    status: "active",
    createdAt: "2023-01-01"
  },
  {
    id: "2",
    name: "HR Manager",
    description: "Human resources management functions",
    userCount: 3,
    permissions: ["user.read", "user.write", "dept.read", "approval.read"],
    status: "active",
    createdAt: "2023-02-15"
  },
  {
    id: "3",
    name: "Department Manager",
    description: "Manage department employees and approvals",
    userCount: 8,
    permissions: ["user.read", "approval.read", "approval.write"],
    status: "active",
    createdAt: "2023-03-01"
  },
  {
    id: "4",
    name: "Employee",
    description: "Basic employee permissions",
    userCount: 142,
    permissions: ["user.read", "approval.read"],
    status: "active",
    createdAt: "2023-01-01"
  }
];

const initialPermissions: Permission[] = [
  { id: "user.read", name: "View Employees", module: "Employee Management", description: "View employee information", type: "read", enabled: true },
  { id: "user.write", name: "Edit Employees", module: "Employee Management", description: "Edit employee information", type: "write", enabled: true },
  { id: "user.delete", name: "Delete Employees", module: "Employee Management", description: "Delete employee records", type: "delete", enabled: true },
  { id: "dept.read", name: "View Departments", module: "Organization Management", description: "View department structure", type: "read", enabled: true },
  { id: "dept.write", name: "Edit Departments", module: "Organization Management", description: "Edit department information", type: "write", enabled: true },
  { id: "dept.admin", name: "Department Admin", module: "Organization Management", description: "Full department management", type: "admin", enabled: true },
  { id: "role.admin", name: "Role Management", module: "Permission Management", description: "Manage user roles", type: "admin", enabled: true },
  { id: "approval.read", name: "View Approvals", module: "Approval Management", description: "View approval processes", type: "read", enabled: true },
  { id: "approval.write", name: "Process Approvals", module: "Approval Management", description: "Process approval requests", type: "write", enabled: true },
  { id: "salary.read", name: "View Payroll", module: "Payroll Management", description: "View payroll information", type: "read", enabled: true },
  { id: "salary.admin", name: "Payroll Admin", module: "Payroll Management", description: "Manage payroll system", type: "admin", enabled: true }
];

export function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: []
  });
  const [formErrors, setFormErrors] = useState<Partial<RoleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = useMemo(() => 
    Array.from(new Set(permissions.map(p => p.module))), 
    [permissions]
  );

  const statistics = useMemo(() => ({
    totalRoles: roles.length,
    activeRoles: roles.filter(role => role.status === "active").length,
    totalPermissions: permissions.length,
    totalModules: modules.length
  }), [roles, permissions, modules]);

  const validateForm = (data: RoleFormData): Partial<RoleFormData> => {
    const errors: Partial<RoleFormData> = {};
    
    if (!data.name.trim()) errors.name = "Role name is required";
    else if (roles.some(r => r.name === data.name && r.id !== selectedRole?.id)) {
      errors.name = "Role name already exists";
    }
    
    if (!data.description.trim()) errors.description = "Role description is required";
    
    return errors;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: []
    });
    setFormErrors({});
  };

  const handleAddRole = async () => {
    setIsSubmitting(true);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      toast.error("Please check form information");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setRoles(prev => [...prev, newRole]);
      setIsAddRoleDialogOpen(false);
      resetForm();
      toast.success(`Role ${formData.name} added successfully`);
    } catch {
      toast.error("Failed to add role, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      toast.error("Please check form information");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? { ...role, ...formData } : role
      ));
      
      setIsEditRoleDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      toast.success(`Role ${formData.name} updated successfully`);
    } catch {
      toast.error("Failed to update role information, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prev => prev.filter(r => r.id !== role.id));
      setDeleteTarget(null);
      toast.success(`Role ${role.name} deleted successfully`);
    } catch {
      toast.error("Failed to delete role, please try again");
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    try {
      const newStatus = role.status === "active" ? "inactive" : "active";
      setRoles(prev => prev.map(r => 
        r.id === role.id ? { ...r, status: newStatus } : r
      ));
      toast.success(`Role ${role.name} ${newStatus === "active" ? "enabled" : "disabled"} successfully`);
    } catch {
      toast.error("Operation failed, please try again");
    }
  };

  const handleTogglePermission = async (permission: Permission) => {
    try {
      setPermissions(prev => prev.map(p => 
        p.id === permission.id ? { ...p, enabled: !p.enabled } : p
      ));
      toast.success(`Permission ${permission.name} ${permission.enabled ? "disabled" : "enabled"} successfully`);
    } catch {
      toast.error("Operation failed, please try again");
    }
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setFormErrors({});
    setIsEditRoleDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const getPermissionTypeBadge = (type: string) => {
    const variants = {
      read: { variant: "secondary" as const, label: "Read", className: "bg-blue-100 text-blue-800" },
      write: { variant: "secondary" as const, label: "Write", className: "bg-orange-100 text-orange-800" },
      delete: { variant: "secondary" as const, label: "Delete", className: "bg-red-100 text-red-800" },
      admin: { variant: "secondary" as const, label: "Admin", className: "bg-purple-100 text-purple-800" }
    };
    const config = variants[type as keyof typeof variants];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? 
      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge> :
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Permission Management</h2>
        <Button className="gap-2" onClick={() => { resetForm(); setIsAddRoleDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.totalRoles}</div>
            <p className="text-muted-foreground">Total Roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.activeRoles}</div>
            <p className="text-muted-foreground">Active Roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalPermissions}</div>
            <p className="text-muted-foreground">Total Permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{statistics.totalModules}</div>
            <p className="text-muted-foreground">Modules</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="h-4 w-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            Permission Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User Count</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">{role.description}</TableCell>
                      <TableCell>{role.userCount}</TableCell>
                      <TableCell>{role.permissions.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(role.status)}
                          <Switch 
                            checked={role.status === "active"}
                            onCheckedChange={() => handleToggleRoleStatus(role)}
                            
                          />
                        </div>
                      </TableCell>
                      <TableCell>{role.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(role)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(role)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {role.userCount === 0 && (
                              <DropdownMenuItem 
                                onClick={() => setDeleteTarget(role)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Role
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permission List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.map(module => (
                  <div key={module} className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2">{module}</h3>
                    <div className="grid gap-3">
                      {permissions.filter(p => p.module === module).map(permission => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getPermissionTypeBadge(permission.type)}
                            <Switch 
                              checked={permission.enabled}
                              onCheckedChange={() => handleTogglePermission(permission)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-role-name">Role Name *</Label>
              <Input 
                id="add-role-name" 
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role-desc">Role Description *</Label>
              <Textarea 
                id="add-role-desc" 
                placeholder="Enter role description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="space-y-4">
              <Label>Permission Configuration</Label>
              {modules.map(module => (
                <div key={module} className="space-y-2">
                  <h4 className="font-medium">{module}</h4>
                  <div className="grid grid-cols-2 gap-2 ml-4">
                    {permissions.filter(p => p.module === module && p.enabled).map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                        />
                        <label htmlFor={permission.id} className="text-sm">
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddRole} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Role"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddRoleDialogOpen(false)} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name *</Label>
              <Input 
                id="edit-role-name" 
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-desc">Role Description *</Label>
              <Textarea 
                id="edit-role-desc" 
                placeholder="Enter role description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="space-y-4">
              <Label>Permission Configuration</Label>
              {modules.map(module => (
                <div key={module} className="space-y-2">
                  <h4 className="font-medium">{module}</h4>
                  <div className="grid grid-cols-2 gap-2 ml-4">
                    {permissions.filter(p => p.module === module && p.enabled).map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`edit-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                        />
                        <label htmlFor={`edit-${permission.id}`} className="text-sm">
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleEditRole} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditRoleDialogOpen(false)} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete role "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarget && handleDeleteRole(deleteTarget)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}