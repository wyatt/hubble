if [ -f /var/run/rebootstage ]; then
	source /var/run/rebootstage
else
	rs=0
	sudo declare rs > /var/run/rebootstage
fi

if [ $rs == 0 ]; then
sudo apt-get update -y
sudo apt-get upgrade -y
sudo SKIP_WARNING=1 rpi-update
rs=(($rs+1))
sudo declare rs > /var/run/rebootstage
sudo reboot now
fi
if [ $rs == 1 ]; then
sudo apt-get install lighttpd usbmount
sudo wget http://downloads.fars-robotics.net/wifi-drivers/install-wifi -O /usr/bin/install-wifi
sudo chmod +x /usr/bin/install-wifi
sudo install-wifi
curl -sL https://install.raspap.com | bash -s -- -r profwyattb/raspap-webgui -b master -y -o 0
sudo sed -i "s/\/app\/img\/wifi-qr-code.php/app\/img\/wifi-qr-code.php/" /var/www/html/guestwifi/templates/hostapd.php
networkingpath=$(php -r "require_once '/var/www/html/wifi/includes/config.php'; echo RASPI_CONFIG_NETWORKING;")
raspappath=$(php -r "require_once '/var/www/html/wifi/includes/config.php'; echo RASPI_CONFIG;")
sudo cp config/wlan1.ini /etc/raspap/networking/wlan1
sudo cp config/raspap-hostapd.ini /etc/raspap/hostapd.ini
sudo service hostapd restart
sudo service raspap restart
sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
fi

