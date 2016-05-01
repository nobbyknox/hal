BEGIN TRANSACTION;

CREATE TABLE "lights" (
    "id" text not null primary key,
    "name" text null,
    "enabled" integer not null,
    "device" integer not null,
    "instance" integer not null,
    "controllerHost" text not null,
    "controllerPort" integer not null
);

CREATE TABLE "scenes" (
    "id" text not null primary key,
    "name" text not null,
    "description" text null,
    "visible" integer not null,
    "enabled" integer not null,
    "buttonMeta" text null,
    "iconMeta" text null,
    "action" text null
);

CREATE TABLE "scenes_lights" (
    "id" text not null primary key,
    "sceneId" integer not null,
    "lightId" integer not null
);

CREATE TABLE "schedules" (
    "id" text not null primary key,
    "cron" text not null,
    "sceneId" integer not null,
    "enabled" integer not null,
    "description" text null
);

CREATE TABLE "token_cache" (
    "id" text not null primary key,
    "token" text not null,
    "userId" integer not null,
    "dateCreated" text null,
    "dateUpdated" text null
);

CREATE TABLE "users" (
    "id" text not null primary key,
    "email" text not null,
    "screenName" text null,
    "password" text null,
    "enabled" integer not null
);

COMMIT;
