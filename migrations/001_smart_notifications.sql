-- Smart Notifications Feature
-- Add notification_rules table
CREATE TABLE IF NOT EXISTS `notification_rules` (
  `rule_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `conditions` JSON NOT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
  INDEX `idx_user_enabled` (`user_id`, `enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add push_subscriptions table
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `subscription_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `endpoint` TEXT NOT NULL,
  `p256dh` VARCHAR(255) NOT NULL,
  `auth` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
