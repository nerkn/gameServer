CREATE TABLE `games` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`desc` text,
	`capacity` int,
	`image` varchar(255),
	`active` boolean,
	`priceEnter` int,
	`priceMin` int,
	`priceMax` int,
	`gameDuration` int,
	`gameRest` int,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameitems` (
	`id` int NOT NULL,
	`game` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`desc` text,
	`image` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `gameitems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gameitems` ADD CONSTRAINT `gameitems_game_games_id_fk` FOREIGN KEY (`game`) REFERENCES `games`(`id`) ON DELETE no action ON UPDATE no action;