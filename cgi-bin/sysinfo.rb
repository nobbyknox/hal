#!/usr/bin/ruby

# Here are the docs:
#   http://www.ruby-doc.org/docs/ProgrammingRuby/
#   http://userpages.umbc.edu/~dhood2/courses/cmsc433/spring2010/?section=Notes&topic=CGI&notes=05

require 'cgi'
require 'date'
require 'json'

def to_readable_uptime(secs)
    if secs < 60
        return "#{secs} second#{secs != 1.0 ? 's' : ''}"
    elsif secs < 60 * 60
        return "%.2f" % (secs / 60) + " minute#{secs / 60 != 1.0 ? 's' : ''}"
    elsif secs < 60 * 60 * 24
        return "%.2f" % (secs / 60 / 60) + " hour#{secs / 60 / 60 != 1.0 ? 's' : ''}"
    else
        return ("%.2f" % (secs / 60 / 60 / 24)) + " day#{secs / 60 / 60 /24 != 1.0 ? 's' : ''}"
    end
end

cgi = CGI.new

puts "Content-type: application/json\n\n"

mem_output = %x(free -h)
uptime_output = %x(cat /proc/uptime)

tot_mem = mem_output.split(" ")[7]
free_mem = mem_output.split(" ")[9]
up_time_seconds = uptime_output.split(" ")[0]

response = {"os" => %x(uname -o).strip, "kernel_version" => %x(uname -r).strip, "host_name" => %x(uname -n).strip, "processor" => %x(uname -m).strip, "tot_mem" => tot_mem, "free_mem" => free_mem, "up_time" => to_readable_uptime(up_time_seconds.to_f)}
puts response.to_json
