BEGIN TRANSACTION;

-- Lights
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES (1, 'Front Spotlight', 1, 1, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES (2, 'Front Lounge', 1, 2, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES (3, 'Main Garage', 1, 3, 0, 'host1', 8083);
INSERT into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) VALUES (4, 'Side Passage', 1, 3, 0, 'host1', 8083);

-- Scenes
INSERT into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) VALUES (1, 'All On', 'Turns everything on', 1, 1, 'button', 'icon', 'on');
INSERT into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) VALUES (2, 'All Off', 'Turns everything off', 1, 1, 'button', 'icon', 'off');
INSERT into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) VALUES (3, 'Arrive At Night', 'Turns on a few lights when we arrive at night', 1, 1, 'button', 'icon', 'on');

-- Lights of scenes
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (1, 1, 1);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (2, 1, 2);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (3, 1, 3);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (4, 1, 4);

INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (5, 2, 1);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (6, 2, 2);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (7, 2, 3);
INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (8, 2, 4);

INSERT into "scenes_lights" (id, scene_id, light_id) VALUES (9, 3, 1);

-- Users
INSERT into "users" (id, email, screenName, password, enabled) VALUES (1, 'test1@host.com', 'Unicode', 'abc', 1);
INSERT into "users" (id, email, screenName, password, enabled) VALUES (2, 'test2@host.com', 'ASCII', 'abc', 1);

COMMIT;
