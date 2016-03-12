BEGIN TRANSACTION;

CREATE TABLE "lights" (
    "id" integer not null primary key autoincrement,
    "name" varchar(255) null,
    "enabled" integer not null,
    "device" integer not null,
    "instance" integer not null,
    "controllerHost" varchar(255) not null,
    "controllerPort" integer not null
);

CREATE TABLE "scenes" (
    "id" integer not null primary key autoincrement,
    "name" varchar(255) not null,
    "description" varchar(255) null,
    "visible" integer not null,
    "enabled" integer not null,
    "buttonClass" varchar(255) null,
    "iconClass" varchar(255) null,
    "action" varchar(255) null
);

CREATE TABLE "schedules" (
    "id" integer not null primary key autoincrement,
    "cron" varchar(255) not null,
    "sceneId" integer not null,
    "enabled" integer not null,
    "description" varchar(255) null
);

CREATE TABLE "token_cache" (
    "id" integer not null primary key autoincrement,
    "token" varchar(255) not null,
    "userId" integer not null,
    "dateCreated" varchar(255) null,
    "dateUpdated" varchar(255) null
);

CREATE TABLE "users" (
    "id" integer not null primary key autoincrement,
    "email" varchar(255) not null,
    "screenName" varchar(255) null,
    "password" varchar(255) null,
    "enabled" integer not null
);

COMMIT;
