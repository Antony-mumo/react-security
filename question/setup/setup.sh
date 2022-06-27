#!/bin/bash
#Start Mongo
a=`grep 1000 /etc/passwd | cut -f1 -d:`
# echo $1
# echo $2
service mongodb restart
sleep 5
chown -R mongodb:mongodb /var/log/mongodb
chown -R mongodb:mongodb /var/lib/mongodb
sudo -u mongodb /usr/bin/mongod --quiet --config /etc/mongod.conf &
sleep 3
	
mongo <  /home/$a/project/application/test/data.js
mongo <  /home/$a/project/application/test/users.js

export dname=$DNAME
su - $a -c "cd /home/$a/project/application/server;PARAM1=browserurl PARAM2=$dname npm start > /dev/null 2>&1 &"
sleep 5
su - $a -c "cd /home/$a/project/application/client;PARAM1=browserurl PARAM2=$dname npm start > /dev/null 2>&1 &"
sleep 5
#rm -rf /home/$a/project/application/.videos
