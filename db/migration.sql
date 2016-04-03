BEGIN TRANSACTION;

-- Version 3.1
ALTER TABLE "scenes_lights" add "enabled" integer not null default 1;

COMMIT;
