# README

The script *hal.conf* was meant to be used with *Upstart* in order to start
HAL when the Raspberry PI reboots. However, it did not work for me. I then
wrote *hal*, which goes into `/etc/init.d/`. That worked.

As FYI, after copying *hal* to `/etc/init.d/`, register the script
so that it will be started when the system restarts. Here is how:

```
cd /etc/init.d
sudo update-rc.d hal defaults
```
