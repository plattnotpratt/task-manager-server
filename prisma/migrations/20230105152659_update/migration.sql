-- AlterTable
ALTER TABLE `Board` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `fname` VARCHAR(64) NULL,
    MODIFY `lname` VARCHAR(64) NULL;
