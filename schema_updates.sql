-- Schoolingo Database Schema Updates
-- Run these SQL statements to add missing tables for new features

-- =====================================================
-- NOTIFICATIONS TABLE
-- Stores all notifications for users
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON,
    url VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Stores Web Push subscriptions for push notifications
-- =====================================================
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
    FOREIGN KEY (student_id) REFERENCES persons(person) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE INDEX idx_rewards_student ON rewards(student_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- =====================================================
-- NOTIFICATION RULES TABLE (if not exists)
-- Stores user notification preferences
-- =====================================================
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
