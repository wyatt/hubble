#!/bin/bash
if [ test $# -eq 0 ]
then
  x=-1
  for i in $(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.[].configuration.datadir')
  do
    x=$(($x+1))
    echo $x
    i=$(sed -e 's/^"//' -e 's/"$//' <<<"$i")
    if [ "$i" = "$UM_MOUNTPOINT" ]
    then
      mountid=$(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.['"${x}"'].mount_id')
      mountpoint=$(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.['"${x}"'].mount_point')
      datadir=$(sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json | jq '.['"${x}"'].configuration.datadir')
      sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:delete $mountid -y
      sudo pumount $datadir
    else
    fi
  done    
elif [ test $# -eq 2 ]
  sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:delete $1 -y
  sudo pumount $2
else
  exit 1
fi

