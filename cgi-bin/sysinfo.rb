#!/usr/bin/ruby

# Here are the docs:
#   http://www.ruby-doc.org/docs/ProgrammingRuby/
#   http://userpages.umbc.edu/~dhood2/courses/cmsc433/spring2010/?section=Notes&topic=CGI&notes=05

require 'net/http'
require 'uri'
require 'cgi'

cgi = CGI.new

puts "Content-type: application/json\n\n"

mem_output = %x(free -h)
boot_output = %x(who -b)

tot_mem = mem_output.split(" ")[7]
free_mem = mem_output.split(" ")[9]

boot_time = boot_output.split(" ")[2] + " " + boot_output.split(" ")[3]

json = {"tot_mem" => tot_mem, "free_mem" => free_mem, "boot_time" => boot_time}
puts json
