#!/usr/bin/ruby

# Here are the docs:
#   http://www.ruby-doc.org/docs/ProgrammingRuby/

require 'net/http'
require 'uri'
require 'cgi'

cgi = CGI.new

puts "Content-type: text/plain\n\n"

http = Net::HTTP.new("192.168.10.221", 8083)

switch_cmd = cgi['switchCmd']
device_num = cgi['deviceNum']
inst_num = cgi['instNum']
return_value = ""

if switch_cmd == "off"
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[" + device_num + "].instances[" + inst_num + "].commandClasses[0x25].Set(0)")
    http.request(request)
elsif switch_cmd == "on"
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[" + device_num + "].instances[" + inst_num + "].commandClasses[0x25].Set(255)")
    http.request(request)
else
    request = Net::HTTP::Post.new("/ZWaveAPI/Run/devices[" + device_num + "].instances[" + inst_num + "].commandClasses[0x25].data.level.value")
    response = http.request(request)
    return_value = response.body
end

puts return_value
