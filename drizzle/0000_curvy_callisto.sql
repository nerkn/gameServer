CREATE TABLE `tokens` (
	`id` varchar(36) NOT NULL,
	`uniqueId` char(21) NOT NULL,
	`token` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokens_token_unique` UNIQUE(`token`),
	CONSTRAINT `token_idx` UNIQUE(`token`),
	CONSTRAINT `uniqueId_idx` UNIQUE(`uniqueId`,`userId`)
);

CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`role` enum('admin','user','moder') NOT NULL DEFAULT 'user',
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(118) NOT NULL,
	`image` varchar(255),
	`activationLink` varchar(36),
	`resetPasswordId` varchar(36),
	`isActivated` boolean NOT NULL DEFAULT false,
	`isBanned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `email_idx` UNIQUE(`email`),
	CONSTRAINT `activationId_idx` UNIQUE(`activationLink`)
);
CREATE INDEX `userId_idx` ON `tokens` (`userId`);
CREATE INDEX `createdAt_idx` ON `users` (`created_at`);