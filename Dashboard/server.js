const path = require("path");
const express = require("express");
const app = express();
const shell = require("shelljs");
const multer = require("multer");
const upload = multer();

const name = "Wyatt";
let hostname = shell.exec("hostname", { silent: true }).stdout.replace(/(\r\n)/g, "");
let iface = shell.exec("route | grep '^default' | grep -o '[^ ]*$'", { silent: true }).stdout;

if (iface !== "wlan0" || iface !== "eth0") {
  iface = "eth0";
}

const properties = { name, hostname, iface };

let statuses = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static("public"));

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
  if (req.iface !== properties.iface && req.iface) ifacechange(req.iface);
  if (statuses.includes(false)) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
    reboot();
  }
});

const namechange = (name) => {
  console.log(`Changing name to ${name}`);
  statuses.push(true);
};

const hostnamechange = (hostname) => {
  console.log(`Changing hostname to ${hostname}`);
  statuses.push(true);
};

const ifacechange = (interface) => {
  console.log(`Changing interface to ${interface}`);
  statuses.push(true);
};

const reboot = () => {
  console.log("Rebooting...");
};
const port = 8080;
app.listen(port);
console.log(`Running at Port ${port}`);
