CREATE TABLE `invitation_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL,
	`code` varchar(8) NOT NULL,
	`usedBy` int,
	`usedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitation_codes_code_unique` UNIQUE(`code`)
);
