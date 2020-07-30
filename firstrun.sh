#!/bin/bash
if [ -f /var/run/rebootstage ]; then
	source /var/run/rebootstage
else
	rs=0
	sudo declare rs > /var/run/rebootstage
fi

IP=$(ip -o -f inet addr show dev wlan0 | awk '/scope global/ {print $4}')

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

runcommand () {
    command=$("$@" 2>&1)
    local status=$?
    if (( status != 0 )); then
        printf "[${RED}ERROR${NC}] $command - $status\n" >&2
        $(runcommand $@)
    else
        printf "[${GREEN}OK${NC}] $@\n" >&2
    fi
}

if [ $rs == 0 ]; then
echo "Updating software"
echo "-----------------"
runcommand "sudo apt-get update -y"
runcommand "sudo apt-get upgrade -y"
runcommand "sudo SKIP_WARNING=1 rpi-update"
runcommand "rs=(($rs+1))"
runcommand "sudo declare rs > /var/run/rebootstage"
runcommand "sudo reboot now"
fi
if [ $rs == 1 ]; then
echo "Installing RaspAP"
echo "-----------------"
runcommand "sudo apt-get install lighttpd usbmount"
runcommand "sudo wget http://downloads.fars-robotics.net/wifi-drivers/install-wifi -O /usr/bin/install-wifi"
runcommand "sudo chmod +x /usr/bin/install-wifi"
runcommand "sudo install-wifi"
runcommand "curl -sL https://install.raspap.com | bash -s -- -r profwyattb/raspap-webgui -b master -y -o 0"
runcommand "sudo sed -i 's/\/app\/img\/wifi-qr-code.php/app\/img\/wifi-qr-code.php/' /var/www/html/guestwifi/templates/hostapd.php"
runcommand "networkingpath=$(php -r 'require_once "/var/www/html/wifi/includes/config.php"; echo RASPI_CONFIG_NETWORKING;')"
runcommand "raspappath=$(php -r 'require_once "/var/www/html/wifi/includes/config.php"; echo RASPI_CONFIG;')"
runcommand "sudo cp config/wlan1.ini ${networkingpath}/wlan1"
runcommand "sudo cp config/raspap-hostapd.ini ${raspappath}/hostapd.ini"
runcommand "sudo service hostapd restart"
runcommand "sudo service raspap restart"
runcommand "sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant-wlan0.conf"
echo "Installing PiHole"
echo "-----------------"
runcommand "sudo service dnsmasq disable"
runcommand "echo 'IPV4_ADDRESS="'"$IP"'"' >> setupVars.conf"
runcommand "sudo ./install.sh --unattended"
runcommand "sudo touch /var/lib/misc/dnsmasq.leases"
runcommand "sudo chown pihole:pihole /var/lib/misc/dnsmasq.leases"
runcommand "sudo apt-get install php-sqlite3"
runcommand "pihole restartdns"
fi
