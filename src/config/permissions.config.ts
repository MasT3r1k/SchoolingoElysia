export const GlobalPermissions = {
  // roles
  TEACHER: 'teacher',
  ADMIN: 'admin_staff',
  STUDENT: 'student',
  PARENT: 'parent',

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
  STUDENT_VIEW: 'students.view',

  // Subjects
  SUBJECTS_VIEW: 'subjects.view',
  SUBJECTS_EDIT: 'subjects.edit',

  // Timetable
  TIMETABLE_VIEW: 'timetable.view',
  TIMETABLE_EDIT: 'timetable.edit',

  // Messages
  MESSAGES_LIST: 'messages.list',
  MESSAGES_DELETE: 'messages.delete',

  // School
  SCHOOL_EDIT: 'school.edit',

  // Payments
  PAYMENTS_ADD: 'payments.add_payment',
  PAYMENTS_OVERVIEW: 'payments.overview',
  PAYMENTS_CREATE_ACCOUNT: 'payments.create_account',
  PAYMENTS_ADMIN_VIEW_ACCOUNT: 'payments.admin.view_account',
  PAYMENTS_REGULAR_ADMIN_VIEW: 'payments.admin.view_regular_payments',
  PAYMENTS_REGULAR_ADMIN_EDIT: 'payments.admin.edit_regular_payments',
  PAYMENTS_REGULAR_ADMIN_CREATE: 'payments.admin.add_regular_payments',
  PAYMENTS_REGULAR_ADMIN_DELETE: 'payments.admin.delete_regular_payments',

  // Traineeship
  TRAINEESHIP_REMOVE_COMPANY: 'manager:traineeship:removeCompany',

  // Tutoring
  TUTORING_VIEW: 'tutoring.view',
  TUTORING_MANAGE: 'tutoring.manage',

  // Online Lessons
  ONLINE_LESSONS_VIEW: 'online_lessons.view',
  ONLINE_LESSONS_MANAGE: 'online_lessons.manage',

  // GDPR
  GDPR_VIEW: 'gdpr.view',
  GDPR_MANAGE: 'gdpr.manage',

  // Canteen
  CANTEEN_VIEW: 'canteen.view',
  CANTEEN_MANAGE: 'canteen.manage',
  CANTEEN_ISSUE: 'canteen.issue'
} as const;

export type PermissionKey = typeof GlobalPermissions[keyof typeof GlobalPermissions];
