IP=$(ip -o -f inet addr show dev wlan0 | awk '/scope global/ {print $4}')
ROUTERIP=$(ip route show | grep -i 'default via'| awk '{print $3}')
sudo sed -i "s|<ipaddr>|${IP}|g" /etc/pihole/setupVars.conf
sudo sed -i "s|<ipaddr>|${IP}|g" /etc/dhcpcd.conf
sudo sed -i "s|<routeripaddr>|${ROUTERIP}|g" /etc/dhcpcd.conf
sudo pihole enable
sudo reboot now