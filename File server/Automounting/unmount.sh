#!/bin/bash
x=-1
for i in $(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.[].configuration.datadir')
do
  x=$(($x+1))
  echo $x
  i=$(sed -e 's/^"//' -e 's/"$//' <<<"$i")
  if [ "$i" = "$UM_MOUNTPOINT" ]
  then
    echo "FOUND: $UM_MOUNTPOINT"
    mountid=$(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.['"${x}"'].mount_id')
    echo "MOUNTID: ${mountid}"
    sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:delete $mountid -y
  else
    echo "NOT FOUND"
  fi
done