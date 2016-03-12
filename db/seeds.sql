BEGIN TRANSACTION;

insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (1, 'Front Spotlight', 1, 1, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (2, 'Front Lounge', 1, 2, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (3, 'Main Garage', 1, 3, 0, 'host1', 8083);
insert into "lights" (id, name, enabled, device, instance, controllerHost, controllerPort) values (4, 'Side Passage', 1, 3, 0, 'host1', 8083);

COMMIT;
