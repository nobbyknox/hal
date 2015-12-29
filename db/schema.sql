BEGIN TRANSACTION;
CREATE TABLE "users" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`email`	TEXT NOT NULL UNIQUE,
	`screenName`	TEXT NOT NULL UNIQUE,
	`password`      TEXT,
	`dateCreated`	TEXT
);
CREATE TABLE "token_cache" (
    `id`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `token` TEXT NOT NULL,
    `userId`    INTEGER NOT NULL UNIQUE,
    `dateCreated` TEXT,
    `dateUpdated` TEXT
);
CREATE TABLE "lights" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`name`	TEXT NOT NULL,
	`device`	INTEGER NOT NULL,
	`instance`	INTEGER NOT NULL,
	`controllerHost`	TEXT NOT NULL,
	`controllerPort`	INTEGER NOT NULL
);
CREATE TABLE "scenes" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`name`	TEXT NOT NULL,
	`description`	TEXT,
	`visible`	INTEGER NOT NULL,
	`buttonClass`	TEXT,
	`iconClass`	TEXT,
	`action` TEXT
);
COMMIT;
