const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const shell = require("shelljs");
const multer = require("multer");
const upload = multer();
const infofile = require("./info.json");

//Properties
let name = infofile.name;
let hostname = shell.exec("hostname", { silent: true }).stdout.replace(/[\r\n]/g, "");
let iface = shell.exec("route | grep '^default' | grep -o '[^ ]*$'", { silent: true }).stdout.replace(/[\r\n]/g, "");
const properties = { name, hostname, iface };

//Global variables
let statuses = [];
let devices;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname + "/public")));

app.engine("html", require("ejs").renderFile);

//Homepage
app.get("/", (req, res) => {
  command = shell.exec(
    "sudo docker exec -u www-data nextcloud php /var/www/html/occ files_external:list --output json",
    {
      silent: true,
    },
  );

  if (command.code == 0) {
    devices = JSON.parse(command);
  } else {
    devices = {};
  }
  res.render(path.join(__dirname + "/index.html"), { name, hostname, iface, devices });
});

app.get("/adapter", () => {
  console.log("Changing adapter");
  shell.exec("changedongle");
});
app.get("/reboot", () => {
  reboot();
});
app.get("/shutdown", () => {
  console.log("Shutting down...");
  shell.exec("sudo shutdown now");
});

// Eject device
app.post("/eject", (req, res) => {
  let index = parseInt(req.body.index);
  let mountid = devices[index].mount_id;
  let datadir = devices[index].configuration.datadir;
  let command = shell.exec(`/etc/usbmount/umount.d/unmount ${mountid} ${datadir}`, { silent: true });
  if (command.code === 0) {
    console.log("Successful unmount");
    res.sendStatus(200);
  } else {
    console.log("Failed to unmount");
    res.sendStatus(500);
  }
});

//Save settings
app.post("/savesettings", (req, res) => {
  req = req.body;
  if (req.name !== properties.name && req.name) namechange(req.name);
  if (req.hostname !== properties.hostname && req.hostname) hostnamechange(req.hostname);
  if (req.password !== properties.password && req.password) passwordchange(req.password);
  if (req.iface !== properties.iface && req.iface) ifacechange(req.iface);
  if (statuses.includes(false)) {
    console.log("Failed to save settings");
    res.sendStatus(500);
  } else {
    console.log("Successfully saved settings");
    res.sendStatus(200);
    if ((req.iface !== properties.iface && req.iface) || (req.hostname !== properties.hostname && req.hostname)) {
      reboot();
    }
  }
});

const namechange = (newname) => {
  console.log(`Changing name to ${newname}`);
  infofile.name = newname;
  name = newname;
  fs.writeFile("info.json", JSON.stringify(infofile), (err) => {
    if (err) {
      console.log("Falied to change name");
      statuses.push(false);
    } else {
      console.log(`Changed name to ${newname}`);
      statuses.push(true);
    }
  });
};
const hostnamechange = (hostname) => {
  console.log(`Changing hostname to ${hostname}`);
  if (
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(
      hostname,
    )
  ) {
    let command = shell.exec(`changehostname ${hostname}`, { silent: true });
    if (command.code === 0) {
      console.log(`Changed hostname to ${hostname}`);
      statuses.push(true);
    } else {
      console.log("Falied to change hostname");
      statuses.push(false);
    }
  } else {
    console.log("Hostname uses invalid syntax");
    statuses.push(false);
  }
};
const passwordchange = (password) => {
  console.log(`Changing password to ${password}`);
  let command = shell.exec(`changepassword "${password}"`, { silent: true });
  if (command.code === 0) {
    console.log(`Changed password to ${password}`);
    statuses.push(true);
  } else {
    console.log("Falied to change password");
    statuses.push(false);
  }
};
const ifacechange = (interface) => {
  console.log(`Changing interface to ${interface}`);
  let command = shell.exec(`changeinterface ${interface}`, { silent: true });
  if (command.code === 0) {
    console.log(`Changed interface to ${interface}`);
    statuses.push(true);
  } else {
    console.log("Falied to change interface");
    statuses.push(false);
  }
};

//Reboot device
const reboot = () => {
  console.log("Rebooting...");
  shell.exec("sudo reboot", { silent: true });
};

// Start server
const port = 1234;
app.listen(port);
console.log(`Running at Port ${port}`);
