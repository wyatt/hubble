#!/bin/bash
LABEL=$(sudo blkid $UM_DEVICE | grep -o ""LABEL.*"" | cut -d'"' -f2)
#echo "Model: ${UM_MODEL}" | sed 's;/;\\/;g' > /home/pi/test.txt
#echo "Device: ${UM_DEVICE}" | sed 's;/;\\/;g' >> /home/pi/test.txt
#echo "Mountpoint: ${UM_MOUNTPOINT}" | sed 's;/;\\/;g' >> /home/pi/test.txt
#echo "Filesystem: ${UM_FILESYSTEM}" | sed 's;/;\\/;g' >> /home/pi/test.txt
#echo "Mountoptions: ${UM_OPTIONS}" | sed 's;/;\\/;g' >> /home/pi/test.txt
#echo "Vendor: ${UM_VENDOR}" | sed 's;/;\\/;g' >> /home/pi/test.txt
#echo "Label: ${LABEL}" | sed 's;/;\\/;g' >> /home/pi/test.txt
sudo docker exec nextcloudpi sudo -u www-data php /var/www/nextcloud/occ files_external:create ${LABEL} local null::null -c datadir=${UM_MOUNTPOINT}