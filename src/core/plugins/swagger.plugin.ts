import { swagger } from '@elysiajs/swagger';

export const swaggerPlugin = swagger({
  path: '/docs',
  documentation: {
    info: {
      title: 'Schoolingo Enterprise API',
      description: 'Comprehensive, high-performance, and secure school management REST API built with ElysiaJS and Bun.',
      version: '2.0.0',
      contact: {
        name: 'Schoolingo Development Team',
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication, Passkeys, 2FA, OAuth & Session Management' },
      { name: 'Users', description: 'User account management, profiles and avatars' },
      { name: 'Students', description: 'Student directory, profiles and family relationships' },
      { name: 'Teachers', description: 'Teacher directory, subjects, and assignments' },
      { name: 'School', description: 'School configuration, classes, and academic years' },
      { name: 'Timetable', description: 'Timetable schedules, substitute lessons, and builder' },
      { name: 'Classbook', description: 'Classbook entries, topics, and student absences' },
      { name: 'Grades', description: 'Grading scale, weight evaluation, and student marks' },
      { name: 'Messages', description: 'Internal messaging system and announcements' },
      { name: 'Storage', description: 'Secure file upload, streaming download, and management' },
      { name: 'Documents', description: 'PDF document generation and official certificate templates' },
      { name: 'Canteen', description: 'School canteen menus, dietary options, and ordering' },
      { name: 'Library', description: 'Library catalogue, book loans, and reservations' },
      { name: 'Traineeship', description: 'Student internships, partner companies, and contracts' },
      { name: 'Fleet', description: 'School vehicle fleet tracking, maintenance, and trips' },
      { name: 'Payments', description: 'Payment records, bank accounts, and school fees' },
      { name: 'System', description: 'System health, database backups, updates, and GDPR' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your session token in the format: Bearer <token>',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Session cookie token',
        },
      },
    },
  },
});
