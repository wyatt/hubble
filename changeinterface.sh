sudo pihole disable
sudo sed -i "s/IPV4_ADDRESS=.*/IPV4_ADDRESS=<ipaddr>/g" /etc/pihole/setupVars.conf
sudo sed -i "s|${IP}|<ipaddr>|g" /etc/dhcpcd.conf
sudo sed -i "s|${ROUTERIP}|<routeripaddr>|g" /etc/dhcpcd.conf
if [ $1 == "eth0" ]
then
	sudo sed -i "s|wlan0|eth0|g" /etc/dhcpcd.conf
	sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.old.conf
elif (($1 == "wlan0"))
	sudo sed -i "s|eth0|wlan0|g" /etc/dhcpcd.conf
	sudo mv /etc/wpa_supplicant/wpa_supplicant.old.conf /etc/wpa_supplicant/wpa_supplicant.conf
fi
sudo reboot now