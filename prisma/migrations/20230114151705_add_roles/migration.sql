-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('USER', 'EDITOR', 'OWNER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER';