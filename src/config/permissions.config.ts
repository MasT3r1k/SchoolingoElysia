export const GlobalPermissions = {
  // User Management
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Role & Permission Management
  ROLES_VIEW: 'roles.view',
  ROLES_EDIT: 'roles.edit',
  PERMISSIONS_VIEW: 'permissions.view',
  
  // Gradebook
  GRADES_VIEW: 'grades.view',
  GRADES_EDIT: 'grades.edit',
  
  // Classbook
  CLASSBOOK_VIEW: 'classbook.view',
  CLASSBOOK_EDIT: 'classbook.edit',
  
  // Administrative
  ADMIN_PANEL: 'admin.panel',
  SYSTEM_STATUS: 'system.status',
  AUDIT_VIEW: 'audit.view',
  ARCHITECTURE_VIEW: 'architecture.view',
  ARCHITECTURE_EDIT: 'architecture.edit',
  
  // Employee Management
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_EDIT: 'employees.edit',
  
  // Attendance
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MANAGE: 'attendance.manage',
  
  // Vacations
  VACATIONS_VIEW: 'vacations.view',
  VACATIONS_MANAGE: 'vacations.manage',
  
  // Salaries
  SALARIES_VIEW: 'salaries.view',
  SALARIES_MANAGE: 'salaries.manage',
  
  // Bonuses
  BONUSES_VIEW: 'bonuses.view',
  BONUSES_MANAGE: 'bonuses.manage',

  // Students
  STUDENT_EDIT: 'students.edit',
  STUDENT_VIEW: 'students.view'
} as const;

export type PermissionKey = typeof GlobalPermissions[keyof typeof GlobalPermissions];
