#!/bin/bash
a=`grep 1000 /etc/passwd | cut -f1 -d:`
list_descendants ()
{
  local children=$(ps -o pid= --ppid "$1")

  for pid in $children
  do
    list_descendants "$pid"
  done

  echo "$children"
}
npm_pids=$(pgrep npm)
for npm_pid in $npm_pids
do
   b=$(list_descendants "$npm_pid")
   kill -9 $b
done

su - $a -c "cd /home/$a/project/application/client;npm start > /dev/null 2>&1 &"
sleep 5
su - $a -c "cd /home/$a/project/application/server;npm start > /dev/null 2>&1 &"
sleep 5


export DISPLAY=:1
rm /home/$a/project/application/node_modules
ln -s /home/$a/project/application/client/node_modules /home/$a/project/application/node_modules
cd /home/$a/project/application/
mongo expense_db  --eval "db.users.remove({})"
cd /home/$a/project/application/test/
npm run test:json:ub
cp /root/setup/json_formatter.py /home/$a/project/application/
cd /home/$a/project/application/
python json_formatter.py
rm json_formatter.py

echo "exit script done" > /home/$a/project/application/exitStatus.txt

