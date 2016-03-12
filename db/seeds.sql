BEGIN TRANSACTION;

-- Lights
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (1, 'Front Spotlight', 1, 1, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (2, 'Front Lounge', 1, 2, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (3, 'Main Garage', 1, 3, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (4, 'Side Passage', 1, 3, 0, 'host1', 8083);

-- Scenes
insert into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) values (1, 'All On', 'Turns everything on', 1, 1, 'button', 'icon', 'on');
insert into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) values (2, 'All Off', 'Turns everything off', 1, 1, 'button', 'icon', 'off');
insert into "scenes" (id, name, description, visible, enabled, buttonClass, iconClass, action) values (3, 'Arrive At Night', 'Turns on a few lights when we arrive at night', 1, 1, 'button', 'icon', 'on');

-- Lights of scenes
insert into "scenes_lights" (id, scene_id, light_id) values (1, 1, 1);
insert into "scenes_lights" (id, scene_id, light_id) values (2, 1, 2);
insert into "scenes_lights" (id, scene_id, light_id) values (3, 1, 3);
insert into "scenes_lights" (id, scene_id, light_id) values (4, 1, 4);

insert into "scenes_lights" (id, scene_id, light_id) values (5, 2, 1);
insert into "scenes_lights" (id, scene_id, light_id) values (6, 2, 2);
insert into "scenes_lights" (id, scene_id, light_id) values (7, 2, 3);
insert into "scenes_lights" (id, scene_id, light_id) values (8, 2, 4);

insert into "scenes_lights" (id, scene_id, light_id) values (9, 3, 1);

COMMIT;
