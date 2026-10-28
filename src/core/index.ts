/**
 * Core Architecture Barrel Export
 * Provides a single unified entry point for core configuration, database, middleware, plugins, and utilities.
 */

// Configuration
export * from './config/env.config';
export * from './config/permissions.config';
export * from './config/security.config';

// Database
export * from './database/connection';
export * from './database/transaction';

// Errors
export * from './errors';

// Middleware & Guards
export * from './middleware/auth.guard';
export * from './middleware/permission.guard';
export * from './middleware/rate-limit.guard';
export * from './middleware/school.guard';

// Plugins
export * from './plugins/sentry.plugin';
export * from './plugins/swagger.plugin';
export * from './plugins/logger.plugin';
export * from './plugins/error.plugin';

// Utilities
export * from './utils/crypto.util';
export * from './utils/response.util';

// Mailer & WebSocket
export * from './mailer/mailer.service';
export * from './websocket/ws.server';
export * from './websocket/ws-qr.service';
