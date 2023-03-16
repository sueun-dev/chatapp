import nmap
import os

# Create a new nmap scanner object
nm = nmap.PortScanner()

# Set the IP address range to scan
nm.scan(hosts="172.30.1.49/24", arguments="-sn")

# Get a list of IP addresses for devices that are up (i.e., responding to ping)
up_ips = [x for x in nm.all_hosts() if nm[x].state() == "up"]

# Print the list of up IP addresses and hostnames
print("Devices on the network:")
for index, ip in enumerate(up_ips):
    hostname = nm[ip].hostname()  # Get the hostname for the current IP address
    print(f"{index + 1}. {ip} ({hostname})")

def shutdown_device(ip):
    os.system(f"ssh {ip} 'sudo shutdown -h -f now'")

# Get user input for the device to shut down
device_number = int(input("Enter the number of the device you want to shut down: "))
target_ip = up_ips[device_number - 1]

# Shut down the selected device
shutdown_device(target_ip)
