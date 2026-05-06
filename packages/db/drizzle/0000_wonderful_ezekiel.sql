CREATE TABLE `waitlist_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_entries_email_unique` ON `waitlist_entries` (`email`);