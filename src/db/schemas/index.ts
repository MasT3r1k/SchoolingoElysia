import { AbsenceTable } from './absence'
import { AddressesTable } from './addresses'
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
import { passwordsTable } from './passwords'
import { payments_classesTable } from './payments_classes'
import { payments_columnsTable } from './payments_columns'
import { payments_paymentsTable } from './payments_payments'
import { Persons } from './persons'
import { persons_degreeTable } from './persons_degree'
import { phone_numbersTable } from './phone_numbers'
import { qrloginTable } from './qrlogin'
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
import { semester_gradesTable } from './semester_grades'
import { notificationsTable } from './notifications'

export interface Database {
  absence: AbsenceTable
  addresses: AddressesTable
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
  degrees: DegreesTable
  districts: DistrictsTable
  emails: emailsTable
  emergency_events: emergency_eventsTable
  emergency_event_types: emergency_event_typesTable
  emergency_event_users: emergency_event_usersTable
  emergency_notifications: emergency_notificationsTable
  events: EventsTable
  family_relations: family_relationsTable
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
  messages_receivers: messages_receiversTable
  notifications: notificationsTable
  passwords: passwordsTable
  payments_classes: payments_classesTable
  payments_columns: payments_columnsTable
  payments_payments: payments_paymentsTable
  persons: Persons
  persons_degree: persons_degreeTable
  phone_numbers: phone_numbersTable
  qrlogin: qrloginTable
  semester_grades: semester_gradesTable
  schools: schoolsTable
  school_breaks: school_breaksTable
  school_domains: school_domainsTable
  school_years: school_yearsTable
  scopes: ScopesTable
  scopes_subjects: scopes_subjectsTable
  students: StudentsTable
  student_groups: Student_groupsTable
  student_homework: Student_homeworkTable
  student_rewards: Student_rewardsTable
  subjects: SubjectsTable
  substitution: SubstitutionTable
  teachers: TeachersTable
  teachers_salary: Teachers_salaryTable
  teachers_subject: Teachers_subjectTable
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
  users_credentials: Users_credentialsTable,
  users_resetpassword: Users_resetpasswordTable,
  webauthn_challenges: webauthn_challengesTable
}