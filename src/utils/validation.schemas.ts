/**
 * Zod Validation Schemas
 * Common validation schemas used across API endpoints
 */
import { z } from 'zod';

// ==================== AUTH ====================
export const loginSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be at most 50 characters')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username contains invalid characters'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(64, 'Password must be at most 64 characters'),
    TFA: z.string().length(6).optional()
});

export const forgotPasswordSchema = z.object({
    username: z.string().min(3).max(50),
    selectedEmail: z.number().int().optional(),
    token: z.string().optional(),
    emailCode: z.string().length(6).optional(),
    newPassword: z.string().min(8).max(64).optional(),
    TFA: z.string().length(6).optional()
});

// ==================== REWARDS ====================
export const createRewardSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(1000).optional(),
    amount: z.number().positive().optional(),
    type: z.enum(['financial', 'certificate', 'prize', 'other']),
    studentId: z.number().int().positive('Student ID must be positive')
});

export const updateRewardSchema = z.object({
    status: z.enum(['pending', 'collected'])
});

// ==================== NOTIFICATIONS ====================
export const createNotificationRuleSchema = z.object({
    type: z.string().min(1).max(50),
    conditions: z.record(z.string(), z.any()).optional(),
    enabled: z.boolean().default(true)
});

export const updateNotificationRuleSchema = z.object({
    enabled: z.boolean().optional(),
    conditions: z.record(z.string(), z.any()).optional()
});

// ==================== MESSAGES ====================
export const sendMessageSchema = z.object({
    subject: z.string().min(1, 'Subject is required').max(255),
    content: z.string().min(1, 'Content is required').max(10000),
    recipients: z.array(z.number().int().positive()).min(1, 'At least one recipient required'),
    type: z.enum(['message', 'excuse', 'request']).default('message'),
    attachments: z.array(z.number().int()).optional()
});

// ==================== FLEET VEHICLES ====================
export const createVehicleSchema = z.object({
    licensePlate: z.string().min(1).max(20),
    brand: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    year: z.number().int().min(1900).max(2100).optional(),
    vin: z.string().max(17).optional(),
    color: z.string().max(50).optional(),
    fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg']).optional(),
    mileage: z.number().int().min(0).optional(),
    status: z.enum(['available', 'reserved', 'maintenance', 'unavailable']).default('available')
});

export const createReservationSchema = z.object({
    vehicleId: z.number().int().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    purpose: z.string().max(500).optional(),
    notes: z.string().max(1000).optional()
});

// ==================== CALENDAR ====================
export const createEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    allDay: z.boolean().default(false),
    type: z.enum(['event', 'holiday', 'exam', 'meeting', 'other']).default('event'),
    visibility: z.enum(['public', 'class', 'private']).default('public')
});

// ==================== SUBSTITUTION ====================
export const createSubstitutionSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lessonNumber: z.number().int().min(0).max(15),
    originalTeacherId: z.number().int().positive(),
    substituteTeacherId: z.number().int().positive().optional(),
    classId: z.number().int().positive(),
    subjectId: z.number().int().positive().optional(),
    type: z.enum(['substitution', 'cancelled', 'room_change', 'merged']),
    note: z.string().max(500).optional()
});

// ==================== TUTORING ====================
export const createTutoringSchema = z.object({
    subjectId: z.number().int().positive(),
    teacherId: z.number().int().positive(),
    maxStudents: z.number().int().min(1).max(30).default(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    room: z.string().max(50).optional(),
    description: z.string().max(500).optional()
});

// ==================== EDUCATION MEASURES ====================
export const createEducationMeasureSchema = z.object({
    studentId: z.number().int().positive(),
    type: z.enum(['praise', 'reprimand', 'warning', 'reduced_behavior', 'other']),
    reason: z.string().min(1).max(1000),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    issuedBy: z.number().int().positive(),
    note: z.string().max(500).optional()
});

// ==================== ID PARAMS ====================
export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
});

// ==================== PAGINATION ====================
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});

// ==================== VALIDATION HELPER ====================
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(body);
    
    if (result.success) {
        return { success: true, data: result.data };
    }
    
    const errors = result.error.issues.map((err: z.ZodIssue) => 
        `${err.path.join('.')}: ${err.message}`
    );
    
    return { success: false, errors };
}
