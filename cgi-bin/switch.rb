#!/usr/bin/ruby

# Here are the docs: http://www.ruby-doc.org/docs/ProgrammingRuby/

require 'net/http'
require 'uri'
require 'cgi'

cgi = CGI.new

puts "Content-type: text/plain\n\n"

http = Net::HTTP.new("192.168.10.221", 8083)

switch_cmd = cgi['switchCmd']
inst_num = cgi['instNum']
success_msg = ""

if switch_cmd == "off"
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[2].instances[" + inst_num + "].commandClasses[0x25].Set(0)")
    http.request(request)
    success_msg = 'The securty light has been turned off'
elsif switch_cmd == "on"
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[2].instances[" + inst_num + "].commandClasses[0x25].Set(255)")
    http.request(request)
    success_msg = 'The securty light has been turned on'
else
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[2].instances[" + inst_num + "].commandClasses[0x25].data.level.value")
    response = http.request(request)
    success_msg = response.body
end

puts success_msg
