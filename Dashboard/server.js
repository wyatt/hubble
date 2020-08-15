const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const shell = require("shelljs");
const multer = require("multer");
const upload = multer();

const infofile = require("./data/info.json");
let name = infofile.name;

let hostname = shell.exec("hostname", { silent: true }).stdout.replace(/[\r\n]/g, "");
let iface = shell.exec("route | grep '^default' | grep -o '[^ ]*$'", { silent: true }).stdout.replace(/[\r\n]/g, "");

iface = "wlan0";

const properties = { name, hostname, iface };

let statuses = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname + "/public")));

app.engine("html", require("ejs").renderFile);

app.get("/", function (req, res) {
  res.render(path.join(__dirname + "/index.html"), { name, hostname, iface });
});

app.post("/adapter", function (req, res) {
  shell.exec("/usr/local/sbin/change-adapter");
});

app.post("/savesettings", function (req, res) {
  req = req.body;
  if (req.name !== properties.name && req.name) namechange(req.name);
  if (req.hostname !== properties.hostname && req.hostname) hostnamechange(req.hostname);
  if (req.password !== properties.password && req.password) passwordchange(req.password);
  if (req.iface !== properties.iface && req.iface) ifacechange(req.iface);
  if (statuses.includes(false)) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
    if ((req.iface !== properties.iface && req.iface) || (req.hostname !== properties.hostname && req.hostname)) {
      reboot();
    }
  }
});

const namechange = (newname) => {
  console.log(`Changing name to ${newname}`);
  infofile.name = newname;
  fs.writeFile("./data/info.json", JSON.stringify(infofile), (err) => {
    if (err) {
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
      statuses.push(false);
    }
  } else {
    statuses.push(false);
  }
};

const passwordchange = (password) => {
  console.log(`Changing password to ${password}`);
  let command = shell.exec(`changepassword "${password}"`, { silent: true });
  if (command.code === 0) {
    console.log(`Changed password to ${password}`);
    statuses.push(true);
  } else statuses.push(false);
};

const ifacechange = (interface) => {
  console.log(`Changing interface to ${interface}`);
  let command = shell.exec(`changeinterface ${interface}`, { silent: true });
  if (command.code === 0) {
    console.log(`Changed interface to ${interface}`);
    statuses.push(true);
  } else statuses.push(false);
};

const reboot = () => {
  console.log("Rebooting...");
  shell.exec("sudo reboot", { silent: true });
};

const port = 1234;
app.listen(port);
console.log(`Running at Port ${port}`);
