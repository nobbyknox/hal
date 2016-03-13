BEGIN TRANSACTION;

-- Lights
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES ('c35adb27-ed0e-4189-b1f4-47de24363fdf', 'Front Spotlight', 1, 1, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES ('cd894a36-c41f-41d9-a6b6-6bbdb0fc0a76', 'Front Lounge', 1, 2, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES ('3e6241bb-dd7f-486a-9b7b-1f4cef0db9a8', 'Main Garage', 1, 3, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES ('9d5209ab-1e2b-463e-9495-d8b5cdd78195', 'Side Passage', 1, 3, 0, 'host1', 8083);

-- Scenes
INSERT into "scenes" (id, name, description, visible, enabled, buttonMeta, iconMeta, action) VALUES ('7830d3fc-bd6b-436e-a006-03b0619008a0', 'All On', 'Turns everything on', 1, 1, 'button', 'icon', 'on');
INSERT into "scenes" (id, name, description, visible, enabled, buttonMeta, iconMeta, action) VALUES ('ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', 'All Off', 'Turns everything off', 1, 1, 'button', 'icon', 'off');
INSERT into "scenes" (id, name, description, visible, enabled, buttonMeta, iconMeta, action) VALUES ('e9d4c4d9-19f1-4367-be05-cc856f6e1e1f', 'Arrive At Night', 'Turns on a few lights when we arrive at night', 1, 1, 'button', 'icon', 'on');

-- Lights of scenes
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('8c6fafdf-b172-4385-bf5a-ca24d665f90c', '7830d3fc-bd6b-436e-a006-03b0619008a0', 'c35adb27-ed0e-4189-b1f4-47de24363fdf');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('da385291-b7a3-47f9-9e82-67f3cda0cc46', '7830d3fc-bd6b-436e-a006-03b0619008a0', 'cd894a36-c41f-41d9-a6b6-6bbdb0fc0a76');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('7e29f9b7-f4b2-42b3-95f4-b7b83aeef667', '7830d3fc-bd6b-436e-a006-03b0619008a0', '3e6241bb-dd7f-486a-9b7b-1f4cef0db9a8');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('42afabb6-f155-4612-bea4-c2edf14ae4ad', '7830d3fc-bd6b-436e-a006-03b0619008a0', '9d5209ab-1e2b-463e-9495-d8b5cdd78195');

INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('176191f9-261d-4e87-80bb-662adc19b158', 'ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', 'c35adb27-ed0e-4189-b1f4-47de24363fdf');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('4806541b-d08f-40ac-884a-902052309fe2', 'ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', 'cd894a36-c41f-41d9-a6b6-6bbdb0fc0a76');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('f17f8f6d-16ff-4d3a-b87b-12e2b73f633d', 'ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', '3e6241bb-dd7f-486a-9b7b-1f4cef0db9a8');
INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('21f5be89-55b0-4120-8af7-5bb4c38235db', 'ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', '9d5209ab-1e2b-463e-9495-d8b5cdd78195');

INSERT into "scenes_lights" (id, sceneId, lightId) VALUES ('aa47b2ea-48d0-4f7c-ac10-1f79579750c1', 'e9d4c4d9-19f1-4367-be05-cc856f6e1e1f', 'c35adb27-ed0e-4189-b1f4-47de24363fdf');

-- Schedules
INSERT into "schedules" (id, cron, sceneId, enabled, description) VALUES ('d2749084-8016-4ed9-b7b2-5bff8c93d3f2', '0 32 4 * * *', '7830d3fc-bd6b-436e-a006-03b0619008a0', 1, 'Lights on at 04:32 every day');
INSERT into "schedules" (id, cron, sceneId, enabled, description) VALUES ('99459713-7f04-4461-8f49-a9207094d123', '0 30 22 * * *', 'ad09e2e5-7178-49d9-b3ba-c6e37c7a8395', 1, 'Lights off at 22:30 every day');

-- Users
INSERT into "users" (id, email, screenName, password, enabled) VALUES ('22fb75ff-0ae4-46d9-893c-e72ba73a1ad3', 'test1@host.com', 'Unicode', 'a9993e364706816aba3e25717850c26c9cd0d89d', 1);
INSERT into "users" (id, email, screenName, password, enabled) VALUES ('f032ca5b-e149-4cb1-bf49-92f312b0ce62', 'test2@host.com', 'ASCII', 'a9993e364706816aba3e25717850c26c9cd0d89d', 1);

COMMIT;
