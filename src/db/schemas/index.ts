import { role_communication_permissionsTable } from './role_communication_permissions'
import { AbsenceTable } from './absence'
import { BackupsTable } from './backups'
import { AddressesTable } from './addresses'
import { AnalyticsVisitsTable } from './analytics'
import { AuditlogTable } from './auditlog'
import { BuildingsTable } from './buildings'
import { Building_exitsTable } from './building_exits'
import { Building_floorsTable } from './building_floors'
import { Building_roomsTable } from './building_rooms'
import { Building_rooms_occupancyTable } from './building_rooms_occupancy'
import { CitiesTable } from './cities'
import { ClassbookTable } from './classbook'
import { ClassesTable } from './classes'
import { Class_serviceTable } from './class_service'
import { CountriesTable } from './countries'
import { DegreesTable } from './degrees'
import { DistrictsTable } from './districts'
import { emailsTable } from './emails'
import { emergency_eventsTable } from './emergency_events'
import { emergency_event_typesTable } from './emergency_event_types'
import { emergency_event_usersTable } from './emergency_event_users'
import { emergency_notificationsTable } from './emergency_notifications'
import { family_relationsTable } from './family_relations'
import { fleetvehicles_expensesTable } from './fleetvehicles_expenses'
import { fleetvehicles_maintenanceTable } from './fleetvehicles_maintenance'
import { fleetvehicles_tripsTable } from './fleetvehicles_trips'
import { fleetvehicles_vehiclesTable } from './fleetvehicles_vehicles'
import { fleetvehicles_vignette_cacheTable } from './fleetvehicles_vignette_cache'
import { gradesTable } from './grades'
import { grades_columnsTable } from './grades_columns'
import { groupsTable } from './groups'
import { homeworkTable } from './homework'
import { insurance_companiesTable } from './insurance_companies'
import { library_booksTable } from './library_books'
import { library_book_authorsTable } from './library_book_authors'
import { library_copiesTable } from './library_copies'
import { library_genresTable } from './library_genres'
import { library_loansTable } from './library_loans'
import { library_reservationsTable } from './library_reservations'
import { login_historyTable } from './login_history'
import { messagesTable } from './messages'
import { messages_receiversTable } from './messages_receivers'
import { messages_draftsTable } from './messages_drafts'
import { passwordsTable } from './passwords'
import { Persons } from './persons'
import { persons_degreeTable } from './persons_degree'
import { phone_numbersTable } from './phone_numbers'
import { login_qrcodesTable } from './login_qrcodes'
import { LdapConfigTable } from './ldap_config'
import { EmailConfigTable } from './email_config'
import { schoolsTable } from './schools'
import { school_breaksTable } from './school_breaks'
import { school_domainsTable } from './school_domains'
import { school_yearsTable } from './school_years'
import { ScopesTable } from './scopes'
import { StudentsTable } from './students'
import { Student_groupsTable } from './student_groups'
import { Student_homeworkTable } from './student_homework'
import { Student_rewardsTable } from './student_rewards'
import { SubjectsTable } from './subjects'
import { SubstitutionTable } from './substitution'
import { TeachersTable } from './teachers'
import { Teachers_salaryTable } from './teachers_salary'
import { Teachers_subjectTable } from './teachers_subject'
import { TimetableTable } from './timetable'
import { TokensTable } from './tokens'
import { Traineeship_companiesTable } from './traineeship_companies'
import { Traineeship_company_ratingTable } from './traineeship_company_rating'
import { Traineeship_company_scopesTable } from './traineeship_company_scopes'
import { Traineeship_configTable } from './traineeship_config'
import { Traineeship_diaryTable } from './traineeship_diary'
import { Traineeship_instructorsTable } from './traineeship_instructors'
import { Traineeship_studentsTable } from './traineeship_students'
import { Traineeship_weeksTable } from './traineeship_weeks'
import { UsersTable } from './users'
import { Users_backup_codesTable } from './users_backup_codes'
import { EventsTable } from './events'
import { Users_credentialsTable } from './user_credentials'
import { webauthn_challengesTable } from './webauthn_challenges'
import { Users_resetpasswordTable } from './users_resetpassword'
import { marking_scalesTable } from './marking_scales'
import { marking_scales_groupsTable } from './marking_scales_groups'
import { scopes_subjectsTable } from './scopes_subjects'
import { ClassbookNotesTable } from './classbook_notes'
import { documentsTable } from './documents'
import { document_permissionsTable } from './document_permissions'
import { semester_gradesTable } from './semester_grades'
import { notificationsTable } from './notifications'
import { notificationRulesTable } from './notification_rules'
import { pushSubscriptionsTable } from './push_subscriptions'
import { PollsTable, PollQuestionsTable, PollOptionsTable, PollResponsesTable, PollAnswersTable, PollAssignsTable, PollSharesTable, PollAssignRecipientsTable, PollResponseQuestionsTable } from './polls'
import { EmployeeAttendanceTable } from './employee_attendance'
import { EmployeeVacationBalanceTable, EmployeeVacationRequestsTable } from './employee_vacations'
import { EmployeeBonusesTable } from './employee_bonuses'
import { educationMeasuresTable } from './education_measures'
import { filesTable } from './files'
import { filesTokensTable } from './files_tokens'
import { messages_filesTable } from './messages_files'
import { TimetableSchemasTable } from './timetable_schemas'
import { TutoringSessionsTable } from './tutoring_sessions'
import { TutoringSignupsTable } from './tutoring_signups'
import { MigrationsTable } from './migrations'
import { OnlineLessonsTable } from './online_lessons'
import { OAuthTokensTable } from './oauth_tokens'
import { SupervisionsTable } from './supervisions'
import { SupervisionPlacesTable } from './supervision_places'
import { InventoryTable } from './inventory'
import { InventoryLogsTable } from './inventory_logs'
import { SystemHeartbeatsTable } from './system_heartbeats'
import { StudentMedicalRecordsTable } from './student_medical_records'
import { PermissionsTable } from './permissions'
import { RolesTable } from './roles'
import { RolePermissionsTable } from './role_permissions'
import { UserRolesTable } from './user_roles'
import { UserPermissionsTable } from './user_permissions'
import { student_historyTable } from './student_history'
import { StudentMatrikaTable } from './student_matrika'
import { StudentMatrikaRecordsTable } from './student_matrika_records'
import { StudentNotesTable } from './student_notes'
import { SchoolEvaluationTemplatesTable } from './school_evaluation_templates'
import { ip_cacheTable } from './ip_cache'
import { ReportCardsTable } from './report_cards'
import { GdprConsentsTable, GdprUserConsentsTable, GdprTrainingTable, GdprUserTrainingTable, GdprRequestsTable, GdprReportsTable, GdprReviewsTable } from './gdpr'
import { MessageRecipientGroupTable, MessageRecipientGroupMemberTable } from './message_recipient_groups'
import { AvatarHistoryTable } from './avatar_history'
import { StudentSubjectExemptionsTable } from './student_subject_exemptions'
import { educationMeasureTypesTable } from './education_measure_types'
import { TeachersEducationTable } from './teachers_education'
import { TeachersAgendaTable } from './teachers_agenda'
import { TeachersEquipmentTable } from './teachers_equipment'
import { TeachersEvaluationsTable } from './teachers_evaluations'
import { TeachersHistoryTable } from './teachers_history'
import { SavedReportsTable } from './saved_reports'
import { SavedReportSharesTable } from './saved_report_shares'
import { SvpTable } from './svp'
import { SvpSubjectsTable } from './svp_subjects'
import { SvpTopicsTable } from './svp_topics'
import { ThematicPlansTable } from './thematic_plans'
import { ThematicPlanItemsTable } from './thematic_plan_items'
import { UserDashboardModulesTable } from './user_dashboard_modules'
import { educationMeasureTemplatesTable } from './education_measure_templates'
import { PaymentsAccountsTable, PaymentsAccountSettingsTable, PaymentsAssignedFeesTable, PaymentsAuditlogTable, PaymentsCategoriesTable, PaymentsFeesMethodTable, PaymentsFeesNotificationTable, PaymentsFeesTable, PaymentsManagersTable, PaymentsPaymentsTable, PaymentsRegularTable, PaymentsRegularUsersTable, PaymentsTransfersTable } from './payments'
import { CanteenAccountsTable, CanteenMealsTable, CanteenMenusTable, CanteenOrdersTable, CanteenSettingsTable } from './canteen'

export interface Database {
  absence: AbsenceTable
  addresses: AddressesTable
  backups: BackupsTable
  analytics_visits: AnalyticsVisitsTable
  auditlog: AuditlogTable
  buildings: BuildingsTable
  building_exits: Building_exitsTable
  building_floors: Building_floorsTable
  building_rooms: Building_roomsTable
  building_rooms_occupancy: Building_rooms_occupancyTable
  cities: CitiesTable
  classbook: ClassbookTable
  classbook_notes: ClassbookNotesTable
  classes: ClassesTable
  class_service: Class_serviceTable
  countries: CountriesTable
  documents: documentsTable
  document_permissions: document_permissionsTable
  degrees: DegreesTable
  districts: DistrictsTable
  education_measures: educationMeasuresTable
  education_measures_templates: educationMeasureTemplatesTable
  education_measures_types: educationMeasureTypesTable
  emails: emailsTable
  email_config: EmailConfigTable
  emergency_events: emergency_eventsTable
  emergency_event_types: emergency_event_typesTable
  emergency_event_users: emergency_event_usersTable
  emergency_notifications: emergency_notificationsTable
  events: EventsTable
  family_relations: family_relationsTable
  files: filesTable;
  files_tokens: filesTokensTable;
  fleetvehicles_expenses: fleetvehicles_expensesTable
  fleetvehicles_maintenance: fleetvehicles_maintenanceTable
  fleetvehicles_trips: fleetvehicles_tripsTable
  fleetvehicles_vehicles: fleetvehicles_vehiclesTable
  fleetvehicles_vignette_cache: fleetvehicles_vignette_cacheTable
  grades: gradesTable
  grades_columns: grades_columnsTable
  groups: groupsTable
  homework: homeworkTable
  insurance_companies: insurance_companiesTable
  library_books: library_booksTable
  library_book_authors: library_book_authorsTable
  library_copies: library_copiesTable
  library_genres: library_genresTable
  library_loans: library_loansTable
  library_reservations: library_reservationsTable
  login_history: login_historyTable
  marking_scales: marking_scalesTable
  marking_scales_groups: marking_scales_groupsTable
  messages: messagesTable
  messages_files: messages_filesTable
  messages_receivers: messages_receiversTable
  messages_drafts: messages_draftsTable
  notifications: notificationsTable
  notification_rules: notificationRulesTable
  push_subscriptions: pushSubscriptionsTable
  passwords: passwordsTable
  payments_accounts: PaymentsAccountsTable
  payments_account_settings: PaymentsAccountSettingsTable
  payments_assigned_fees: PaymentsAssignedFeesTable
  payments_auditlog: PaymentsAuditlogTable
  payments_categories: PaymentsCategoriesTable
  payments_fees: PaymentsFeesTable
  payments_fees_method: PaymentsFeesMethodTable
  payments_fees_notification: PaymentsFeesNotificationTable
  payments_managers: PaymentsManagersTable
  payments_payments: PaymentsPaymentsTable
  payments_regular: PaymentsRegularTable
  payments_regular_users: PaymentsRegularUsersTable
  payments_transfers: PaymentsTransfersTable
  persons: Persons
  persons_degree: persons_degreeTable
  phone_numbers: phone_numbersTable
  ldap_config: LdapConfigTable
  login_qrcodes: login_qrcodesTable
  semester_grades: semester_gradesTable
  schools: schoolsTable
  school_breaks: school_breaksTable
  school_domains: school_domainsTable
  school_years: school_yearsTable
  scopes: ScopesTable
  scopes_subjects: scopes_subjectsTable
  students: StudentsTable
  student_groups: Student_groupsTable
  student_history: student_historyTable
  student_homework: Student_homeworkTable
  rewards: Student_rewardsTable
  subjects: SubjectsTable
  substitution: SubstitutionTable
  teachers: TeachersTable
  teachers_salary: Teachers_salaryTable
  teachers_subject: Teachers_subjectTable
  timetable_schemas: TimetableSchemasTable
  timetable: TimetableTable
  tokens: TokensTable
  traineeship_companies: Traineeship_companiesTable
  traineeship_company_rating: Traineeship_company_ratingTable
  traineeship_company_scopes: Traineeship_company_scopesTable
  traineeship_config: Traineeship_configTable
  traineeship_diary: Traineeship_diaryTable
  traineeship_instructors: Traineeship_instructorsTable
  traineeship_students: Traineeship_studentsTable
  traineeship_weeks: Traineeship_weeksTable
  users: UsersTable
  users_backup_codes: Users_backup_codesTable
  users_credentials: Users_credentialsTable
  users_resetpassword: Users_resetpasswordTable
  webauthn_challenges: webauthn_challengesTable
  polls: PollsTable
  poll_answers: PollAnswersTable
  poll_assigns: PollAssignsTable
  poll_assign_recipients: PollAssignRecipientsTable
  poll_questions: PollQuestionsTable
  poll_options: PollOptionsTable
  poll_responses: PollResponsesTable
  poll_shares: PollSharesTable
  poll_response_questions: PollResponseQuestionsTable
  // Employee management tables
  employee_attendance: EmployeeAttendanceTable
  employee_vacation_balance: EmployeeVacationBalanceTable
  employee_vacation_requests: EmployeeVacationRequestsTable

  employee_bonuses: EmployeeBonusesTable
  role_communication_permissions: role_communication_permissionsTable
  _migrations: MigrationsTable
  online_lessons: OnlineLessonsTable
  oauth_tokens: OAuthTokensTable
  supervisions: SupervisionsTable
  supervision_places: SupervisionPlacesTable
  inventory: InventoryTable
  inventory_logs: InventoryLogsTable
  system_heartbeats: SystemHeartbeatsTable
  student_medical_records: StudentMedicalRecordsTable
  permissions: PermissionsTable
  roles: RolesTable
  role_permissions: RolePermissionsTable
  user_roles: UserRolesTable
  user_permissions: UserPermissionsTable
  student_matrika: StudentMatrikaTable
  student_matrika_records: StudentMatrikaRecordsTable
  student_notes: StudentNotesTable
  tutoring_sessions: TutoringSessionsTable
  tutoring_signups: TutoringSignupsTable
  school_evaluation_templates: SchoolEvaluationTemplatesTable
  ip_cache: ip_cacheTable
  gdpr_consents: GdprConsentsTable
  gdpr_user_consents: GdprUserConsentsTable
  gdpr_training: GdprTrainingTable
  gdpr_user_training: GdprUserTrainingTable
  gdpr_requests: GdprRequestsTable
  gdpr_reports: GdprReportsTable
  gdpr_reviews: GdprReviewsTable
  report_cards: ReportCardsTable
  message_recipient_groups: MessageRecipientGroupTable
  message_recipient_group_members: MessageRecipientGroupMemberTable
  avatar_history: AvatarHistoryTable
  student_subject_exemptions: StudentSubjectExemptionsTable
  teachers_education: TeachersEducationTable
  teachers_agenda: TeachersAgendaTable
  teachers_equipment: TeachersEquipmentTable
  teachers_evaluations: TeachersEvaluationsTable
  teachers_history: TeachersHistoryTable
  saved_reports: SavedReportsTable
  saved_report_shares: SavedReportSharesTable
  svp: SvpTable
  svp_subjects: SvpSubjectsTable
  svp_topics: SvpTopicsTable
  thematic_plans: ThematicPlansTable
  thematic_plan_items: ThematicPlanItemsTable
  user_dashboard_modules: UserDashboardModulesTable
  canteen_accounts: CanteenAccountsTable
  canteen_meals: CanteenMealsTable
  canteen_menus: CanteenMenusTable
  canteen_orders: CanteenOrdersTable
  canteen_settings: CanteenSettingsTable
}



