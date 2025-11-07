CREATE TABLE `medicaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`prix` real NOT NULL,
	`quantite` integer NOT NULL,
	`date_expiration` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
