CREATE TABLE `ventes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicament_id` integer NOT NULL,
	`nom_medicament` text NOT NULL,
	`quantite_vendue` integer NOT NULL,
	`prix_unitaire` real NOT NULL,
	`prix_total` real NOT NULL,
	`nom_client` text,
	`date_vente` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`medicament_id`) REFERENCES `medicaments`(`id`) ON UPDATE no action ON DELETE no action
);
