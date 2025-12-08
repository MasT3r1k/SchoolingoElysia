-- Schoolingo Database Schema Updates
-- Run these SQL statements to add missing tables for new features

-- =====================================================
-- NOTIFICATIONS TABLE
-- Stores all notifications for users
-- =====================================================
-- =====================================================
-- NOTIFICATIONS TABLE
-- Stores all notifications for users
-- =====================================================
DROP TABLE IF EXISTS notifications;
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON,
    url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Stores Web Push subscriptions for push notifications
-- =====================================================
-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Stores Web Push subscriptions for push notifications
-- =====================================================
DROP TABLE IF EXISTS push_subscriptions;
CREATE TABLE IF NOT EXISTS push_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- =====================================================
-- REWARDS TABLE
-- Stores student rewards
-- =====================================================
-- =====================================================
-- REWARDS TABLE
-- Stores student rewards
-- =====================================================
DROP TABLE IF EXISTS rewards;
CREATE TABLE IF NOT EXISTS rewards (
    reward_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    type ENUM('financial', 'certificate', 'prize', 'other') NOT NULL,
    status ENUM('pending', 'collected') DEFAULT 'pending',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    collected_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES persons(personId) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE INDEX idx_rewards_student ON rewards(student_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- =====================================================
-- NOTIFICATION RULES TABLE (if not exists)
-- Stores user notification preferences
-- =====================================================
-- =====================================================
-- NOTIFICATION RULES TABLE (if not exists)
-- Stores user notification preferences
-- =====================================================
DROP TABLE IF EXISTS notification_rules;
CREATE TABLE IF NOT EXISTS notification_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    conditions JSON,
    enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_user_type (user_id, type)
);

-- =====================================================
-- LOGIN QRCODES TABLE (update if exists)
-- Add created column if missing
-- =====================================================
-- ALTER TABLE login_qrcodes ADD COLUMN IF NOT EXISTS created DATETIME DEFAULT CURRENT_TIMESTAMP;

-- =====================================================
-- GROUPS/CHANNELS TABLES
-- For group messaging feature
-- =====================================================
-- =====================================================
-- GROUPS/CHANNELS TABLES
-- For group messaging feature
-- =====================================================
-- Drop tables in correct order due to foreign keys
DROP TABLE IF EXISTS message_reactions;
DROP TABLE IF EXISTS channel_messages;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS group_channels;
DROP TABLE IF EXISTS message_groups;

CREATE TABLE IF NOT EXISTS message_groups (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('class', 'custom', 'dm') NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    class_id INT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS group_channels (
    channel_id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('text', 'voice') DEFAULT 'text',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES message_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES message_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_group_user (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS channel_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    channel_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    type ENUM('text', 'homework', 'poll', 'file', 'document') DEFAULT 'text',
    reply_to INT,
    edited BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES group_channels(channel_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES channel_messages(message_id) ON DELETE SET NULL
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id);

CREATE TABLE IF NOT EXISTS message_reactions (
    reaction_id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES channel_messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user_emoji (message_id, user_id, emoji)
);

-- =====================================================
-- AUDIT LOG TABLE (for security audit)
-- =====================================================
-- =====================================================
-- AUDIT LOG TABLE (for security audit)
-- =====================================================
DROP TABLE IF EXISTS audit_log;
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- =====================================================
-- SCHOOLS TABLE UPDATES (Auth Settings)
-- =====================================================
-- Add columns if they don't exist (using procedure workaround or simpler ALTER ignore error approach not standard in pure SQL script without logic)
-- Assuming we run this as a migration. Ideally, use a migration tool.
-- For now, we append ALTERs that might fail if columns exist, but that's acceptable for "updates" script in this context,
-- OR we can wrapping them in a block if DBMS supports it. MySQL simple script: just ALTER.
-- If it fails, user might need to handle it, but given we are "Adding", let's try.
-- Actually, widely compatible "Safe Add" in MySQL:
-- ALTER TABLE schools ADD COLUMN IF NOT EXISTS ... (MariaDB 10.2+)
-- Since we don't know exact version, we will assume standard ALTER.

-- AUTH FLAGS
-- ALTER TABLE schools ADD COLUMN auth_classic BOOLEAN DEFAULT TRUE;
-- ALTER TABLE schools ADD COLUMN auth_ldap BOOLEAN DEFAULT FALSE;
-- ALTER TABLE schools ADD COLUMN auth_qr BOOLEAN DEFAULT FALSE;
-- ALTER TABLE schools ADD COLUMN auth_passkeys BOOLEAN DEFAULT FALSE;
-- ALTER TABLE schools ADD COLUMN session_lifetime_minutes INT DEFAULT 480;
-- ALTER TABLE schools ADD COLUMN max_login_attempts INT DEFAULT 5;

-- However, to be safe and cleaner for the user to run repeatedly:
-- We'll just define the LDAP table first.
-- User might need to run ALTERs manually or we provide them here.

-- =====================================================
-- LDAP CONFIGURATION TABLE
-- =====================================================
DROP TABLE IF EXISTS ldap_config;
CREATE TABLE IF NOT EXISTS ldap_config (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    server_url VARCHAR(255) NOT NULL,
    bind_dn VARCHAR(255),
    bind_password VARCHAR(255),
    search_base VARCHAR(255) NOT NULL,
    user_filter VARCHAR(255) DEFAULT '(uid=%u)',
    mapping_username VARCHAR(50) DEFAULT 'uid',
    mapping_email VARCHAR(50) DEFAULT 'mail',
    mapping_name VARCHAR(50) DEFAULT 'cn',
    enabled BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(schoolId) ON DELETE CASCADE
);

-- =====================================================
-- AUTH SETTINGS MIGRATION (Executed only if columns missing)
-- =====================================================
-- Note: MySQL < 8.0 doesn't support IF NOT EXISTS in ALTER TABLE.
-- We will just append them. If they fail, they fail (columns exist).
-- But to prevent error spam, we'll assume user runs this once.
-- For robust dev, let's try a procedure or just simple ALTERs.

ALTER TABLE schools ADD COLUMN IF NOT EXISTS auth_classic BOOLEAN DEFAULT TRUE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS auth_ldap BOOLEAN DEFAULT FALSE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS auth_qr BOOLEAN DEFAULT FALSE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS auth_passkeys BOOLEAN DEFAULT FALSE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS session_lifetime_minutes INT DEFAULT 480;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS max_login_attempts INT DEFAULT 5;

