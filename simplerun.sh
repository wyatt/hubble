#!/bin/bash

#Variables
IP=$(ip -o -f inet addr show dev wlan0 | awk '/scope global/ {print $4}')
ROUTERIP=$(ip route show | grep -i 'default via'| awk '{print $3}')

echo "Updating software"
echo "-----------------"
sudo apt-get update -y
sudo apt-get upgrade -y
sudo SKIP_WARNING=1 rpi-update
sudo declare rs > /var/run/rebootstage
sudo reboot now
echo "Installing software"
echo "-------------------"
sudo apt-get install lighttpd usbmount
sudo wget http://downloads.fars-robotics.net/wifi-drivers/install-wifi -O /usr/bin/install-wifi
sudo chmod +x /usr/bin/install-wifi
sudo install-wifi
echo "Installing RaspAP"
echo "-----------------"
curl -sL https://install.raspap.com | bash -s -- -r profwyattb/raspap-webgui -b master -y -o 0
networkingpath=$(php -r 'require_once "/var/www/html/wifi/includes/config.php"; echo RASPI_CONFIG_NETWORKING;')
raspappath=$(php -r 'require_once "/var/www/html/wifi/includes/config.php"; echo RASPI_CONFIG;')
sudo sed -i 's/\/app\/img\/wifi-qr-code.php/app\/img\/wifi-qr-code.php/' /var/www/html/guestwifi/templates/hostapd.php
sudo cp config/wlan1.ini ${networkingpath}/wlan1
sudo cp config/raspap-hostapd.ini ${raspappath}/hostapd.ini
sudo service hostapd restart
sudo service raspap restart
#sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
echo "Installing PiHole"
echo "-----------------"
sudo service dnsmasq disable
echo 'IPV4_ADDRESS="'"$IP"'"' >> setupVars.conf
mkdir /etc/pihole/
mv setupVars.conf /etc/pihole/setupVars.conf
sudo ./install.sh --unattended
sudo touch /var/lib/misc/dnsmasq.leases
sudo chown pihole:pihole /var/lib/misc/dnsmasq.leases
sudo apt-get install php-sqlite3
sudo pihole restartdns
sudo pihole disable
sudo sed -i "s/IPV4_ADDRESS=.*/IPV4_ADDRESS=<ipaddr>/g" /etc/pihole/setupVars.conf
sudo sed -i "s|${IP}|<ipaddr>|g" /etc/dhcpcd.conf
sudo sed -i "s|${ROUTERIP}|<routeripaddr>|g" /etc/dhcpcd.conf
#Change hostname