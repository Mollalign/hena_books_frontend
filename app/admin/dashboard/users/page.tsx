"use client";

import { useState, useEffect } from "react";
import { Trash2, Users, Search, Shield, UserCheck, Mail, Calendar, AlertTriangle, UserX } from "lucide-react";
import { usersService, User } from "@/lib/services/users";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await usersService.deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.detail || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-50)] dark:bg-[var(--accent-950)] border border-[var(--accent-200)] dark:border-[var(--accent-800)] mb-3">
            <Users className="w-4 h-4 text-[var(--accent-500)]" />
            <span className="text-xs font-medium text-[var(--accent-600)] dark:text-[var(--accent-400)]">
              User Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Community Members
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your platform users and their permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--primary-500)]">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-[var(--border)]"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)]">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/30">
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent-50)] dark:bg-[var(--accent-950)] mx-auto mb-6 flex items-center justify-center">
            <Users className="w-10 h-10 text-[var(--accent-500)]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            {searchQuery ? "No users found" : "No users yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `No users match "${searchQuery}". Try a different search term.`
              : "Users will appear here once they register on the platform."
            }
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-[var(--border)] rounded-2xl overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/50">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-[var(--muted)]/30">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : "bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)]"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          user.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {user.is_active ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                          disabled={user.role === "admin"}
                          title={user.role === "admin" ? "Cannot delete admin users" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-[var(--border)] rounded-2xl p-5 bg-background hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        : "bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)]"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      user.is_active
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {user.is_active ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  {user.role !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-destructive/10">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Delete User</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {userToDelete && (
            <div className="flex items-center gap-4 p-4 bg-[var(--muted)]/50 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {userToDelete.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{userToDelete.name}</p>
                <p className="text-sm text-muted-foreground truncate">{userToDelete.email}</p>
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? All associated data including reading history and sessions will be permanently removed.
          </p>
          
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={deleting} className="h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
