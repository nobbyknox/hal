# README

The script *hal.conf* was meant to be used with *Upstart* in order to start
HAL when the Raspberry Pi reboots. However, it did not work for me. I then
wrote *hal*, which goes into <code>/etc/init.d/</code>. That worked.

As FYI, after copying *hal* to <code>/etc/init.d/</code>, register the script
so that it will be started when the system restarts. Here is how:

<pre>
cd /etc/init.d
sudo update-rc.d hal defaults
</pre>
