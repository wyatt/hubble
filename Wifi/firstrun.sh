sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
sudo wget http://downloads.fars-robotics.net/wifi-drivers/install-wifi -O /usr/bin/install-wifi
sudo chmod +x /usr/bin/install-wifi
sudo install-wifi
curl -sL https://install.raspap.com | bash -s -- -r profwyattb/raspap-webgui -b master -y -o 0
sudo sed -i "s/\/app\/img\/wifi-qr-code.php/app\/img\/wifi-qr-code.php/" /var/www/html/guestwifi/templates/hostapd.php

#List of files to add interface in:
#/etc/raspap/hostapd.ini #simple sed wlan0 -> wlan1
#/etc/raspap/networking/wlan1.ini #don't know
#/etc/hostapd/hostapd.conf #simple sed wlan0 -> wlan1
#/etc/dnsmasq.d/090_raspap.conf #simple sed wlan0 -> wlan1 
#/etc/dhcpcd.conf #simple sed wlan0 -> wlan1 