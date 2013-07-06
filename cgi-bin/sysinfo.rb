#!/usr/bin/ruby

# Here are the docs:
#   http://www.ruby-doc.org/docs/ProgrammingRuby/
#   http://userpages.umbc.edu/~dhood2/courses/cmsc433/spring2010/?section=Notes&topic=CGI&notes=05

require 'cgi'
require 'date'
require 'json'

cgi = CGI.new

puts "Content-type: application/json\n\n"

mem_output = %x(free -h)
boot_output = %x(who -b)

tot_mem = mem_output.split(" ")[7]
free_mem = mem_output.split(" ")[9]

boot_time = DateTime.parse(boot_output.split(" ")[2] + " " + boot_output.split(" ")[3])

response = {"platform" => %x(uname -s).strip, "kernel_version" => %x(uname -r).strip, "host_name" => %x(uname -n).strip,  "tot_mem" => tot_mem, "free_mem" => free_mem, "boot_time" => boot_time.strftime("%s%z")}
puts response.to_json
