# 🌐 hubble
### Super simple restricted wifi, adblocking and file sharing



1. Run 

    ```bash
    sudo wget http://downloads.fars-robotics.net/wifi-drivers/install-wifi -O /usr/bin/install-wifi
    sudo chmod +x /usr/bin/install-wifi
    sudo install-wifi
    ```

2. Add "nohook wpa_supplicant" to /etc/dhcpcd.conf
3. Install Raspap with install location "/var/www/html/wifi/"

    ```bash
    curl -sL https://install.raspap.com | bash
    ```

4. Configure hotspot to use wlan1 as AP and wlan0 as client
5. Edit QR Code img "src" in "/var/www/html/guestwifi/templates/hostapd.php"

    ```bash
    sudo sed -i "s/\/app\/img\/wifi-qr-code.php/app\/img\/wifi-qr-code.php/" /var/www/html/guestwifi/templates/hostapd.php
    ```

6. Added a qr code print option in "/var/www/html/guestwifi/templates/hostapd.php"

    [hostapd.php](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f9f02f46-ad9b-497e-a4e3-03712d38c752/hostapd.php)

7. Change lighttpd.conf to only listen to range "192.168.1.*"

    ```bash
    server.port                 = 80 #Add server.bind underneath
    server.bind                 = "192.168.1.*"
    ```

8. Create script that limits hotspot device access.

    ```bash
    #!/bin/bash
    #AP Vars
    apiface=$(cat /etc/hostapd/hostapd.conf | grep '^interface' | grep -o '[^=]*$')
    apip=$(ip -o -f inet addr show $apiface | awk '/scope global/ {print $4}')
    apcidr=$(echo $apip | grep -oP '\/(.*)')
    apiprange=$(echo $apip | grep -oP '^(.*?\..*?\..*?)\.')
    #Inet Vars
    inetiface=$(route | grep '^default' | grep -o '[^ ]*$')
    inetip=$(ip -o -f inet addr show $inetiface | awk '/scope global/ {print $4}')
    inetcidr=$(echo $inetip | grep -oP '\/(.*)')
    inetcleanip=$(echo $inetip | grep -oP '^.*?(?=\/)')
    inetiprange=$(echo $inetip | grep -oP '^(.*?\..*?\..*?)\.')
    inetgateway=$(route -n | grep 'UG[ \t]' | awk '{print $2}')
    #Static IP Config
    if ! grep -q "#wlan0 Static IP Configuration" /etc/dhcpcd.conf; then
            echo "#wlan0 Static IP Configuration" >> /etc/dhcpcd.conf
            echo "interface $inetiface" >> /etc/dhcpcd.conf
            echo "static ip_address=$inetip" >> /etc/dhcpcd.conf
            echo "static routers=$inetgateway" >> /etc/dhcpcd.conf
            echo "static domain_name_servers=1.1.1.1" >> /etc/dhcpcd.conf
    fi
    #Binds lighttpd to a specific server
    if ! grep -q "server.bind" /etc/lighttpd/lighttpd.conf; then
            sudo sed -i "/^server.port/a server.bind                 = \"$inetcleanip\"" /etc/lighttpd/lighttpd.conf
    fi
    ```

9. Run 

    ```bash
    sudo apt install php7.3 php7.3-gd php7.3-sqlite3 php7.3-curl php7.3-zip php7.3-xml php7.3-mbstring php7.3-mysql php7.3-bz2 php7.3-intl php7.3-smbclient php7.3-imap php7.3-gmp
    sudo apt install mariadb-server
    sudo mysql_secure_installation
    sudo mysql -u root -p
    CREATE DATABASE <databasename>;
    CREATE USER 'nextclouduser'@'localhost' IDENTIFIED BY '[PASSWORD]';
    GRANT ALL PRIVILEGES ON <databasename>.* TO 'nextclouduser'@'localhost';
    FLUSH PRIVILEGES;
    ```
