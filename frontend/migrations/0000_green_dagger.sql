CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`site_location` text NOT NULL,
	`make_model` text NOT NULL,
	`range` text NOT NULL,
	`serial_no` text NOT NULL,
	`calibration_gas` text NOT NULL,
	`gas_canister_details` text NOT NULL,
	`date_of_calibration` text NOT NULL,
	`calibration_due_date` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);