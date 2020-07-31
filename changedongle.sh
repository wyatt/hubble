driverlog=$(sudo install-wifi)
echo $driverlog | grep "already loaded and running.$"
if [ $? == 1]
then
sudo reboot