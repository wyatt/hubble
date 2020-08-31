let info = window.info;

//Helper code
const $ = (selector) => document.querySelectorAll(selector);
const $_ = (selector) => document.querySelector(selector);
const isEmpty = (value) => {
  if (value == null || value.length == 0) return true;
  else return false;
};

//Functions
const welcome = (name) => {
  const hour = new Date().getHours();
  let period;
  if (hour >= 4 && hour <= 11) period = "morning";
  if (hour >= 12 && hour <= 16) period = "afternoon";
  if (hour >= 17) period = "evening";
  $_("#welcome").innerHTML = `Good ${period}, ${name}`;
};
const mounts = (devices) => {
  if (!devices) {
    return;
  }
  for (let i = 0; i < devices.length; i++) {
    $_("#noDevices").style.display = "none";
    $(".mount")[i].style.display = "flex";
    $(".mount p")[i].innerHTML = devices[i].mount_point.replace("/", "");
  }
  return;
};
const interfaces = (iface) => {
  if (iface) {
    $_(`input[value=${info.iface}]`).attr("checked", true);
  } else {
    $_("#interface-message").innerHTML = "Interface not detected! <span id='iface-more-info'>More info</span>";
    $_("#iface-more-info").addEventListener("click", () => {
      window.alert(
        "This alert means that the web interface couldn't work out what interface you're using. If this error continues after a reboot, please file an issue.",
      );
    });
  }
};
const pageToggle = (action, page) => {
  let parentpage;
  if (page == "settings") parentpage = "home";
  else if (page == "devices") parentpage = "settings";
  if (action == "back") {
    $_(`#${parentpage}-page`).style.display = "flex";
    $_(`#${page}-page`).style.display = "none";
    $_("#settings-form").reset();
  } else {
    $_(`#${parentpage}-page`).style.display = "none";
    $_(`#${page}-page`).style.display = "flex";
  }
};

//Value setting
welcome(info.name);
mounts(info.devices);
interfaces(info.iface);

//Asset loading
feather.replace();
particlesJS.load("particles", "js/particles.json");

//Color change
const colorchange = (icon) => {
  colorlist = {
    "corner-right-up": "#80e27e",
    "folder": "#6ec6ff",
    "wifi": "#ff7961",
    "settings": "#c79100",
    "submit": "#c79100",
    "adapter": "#9162e4",
    "terminal": "#ffc947",
    "reboot": "#80e27e",
    "shutdown": "#ff844c",
    "devices": "#6ec6ff",
    "umount": "#ff844c",
    "reset-color": "#000",
  };
  color = colorlist[icon];
  window.pJSDom[0].pJS.particles.array.forEach((item) => {
    item.color.value = color;
    item.color.rgb = hexToRgb(color);
  });
  window.pJSDom[0].pJS.particles.line_linked.color_rgb_line = hexToRgb(color);
};
$(".icon").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    colorchange(item.id);
  });
  item.addEventListener("mouseleave", () => {
    colorchange("reset-color");
  });
});

//Change pages
$_("#settings").addEventListener("click", () => {
  pageToggle("", "settings");
});
$_("#back-settings").addEventListener("click", () => {
  pageToggle("back", "settings");
});
$_("#devices").addEventListener("click", () => {
  pageToggle("", "devices");
});
$_("#back-devices").addEventListener("click", () => {
  pageToggle("back", "devices");
});

//Settings buttons
$_("#adapter").addEventListener("click", () => {
  window.alert(
    "⚠ This device will now shutdown. Once the device is shutdown, change adapters and turn the plug on and off. The driver will then be installed and the device will reboot. Then, if the adapter is supported, everything should be working!",
  );
  const request = new XMLHttpRequest();
  request.open("get", "adapter/");
  request.send();
  setTimeout(() => {
    location.reload();
  }, 2000);
});
$_("#terminal").addEventListener("click", () => {
  window.alert("⚠ Please note: This tool is very powerful and should only be used if you know what you're doing!");
  window.location.href = `${window.location.origin}:4200`;
});
$_("#reboot").addEventListener("click", () => {
  window.alert("⚠ This device will now reboot. Continue?");
  const request = new XMLHttpRequest();
  request.open("get", "reboot/");
  request.send();
});
$_("#shutdown").addEventListener("click", () => {
  window.alert("⚠ This device will now shutdown. Continue?");
  const request = new XMLHttpRequest();
  request.open("get", "shutdown/");
  request.send();
});

// Eject request
const eject = (num) => {
  $_(`#eject_${num}`).innerHTML = "Ejecting";
  const request = new XMLHttpRequest();
  request.open("post", "eject/");
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ index: num.toString() }));
  request.onreadystatechange = () => {
    if (request.readyState == 4) {
      if (request.status == 200) ejectSuccess(num);
      else ejectError(num);
    }
  };
};
const ejectSuccess = (num) => {
  $_(`#eject_${num}`).innerHTML = "Save to remove";
  $_(`#eject_${num}`).style.color = "white";
  $_(`#eject_${num}`).style.backgroundColor = "#087f23";
  setTimeout(() => {
    $_(`#eject_${num}`).parentElement.style.display = "none";
  }, 2000);
  return;
};
const ejectError = (num) => {
  $_(`#eject_${num}`).innerHTML = "Error";
  $_(`#eject_${num}`).style.color = "white";
  $_(`#eject_${num}`).style.backgroundColor = "#ba000d";
  setTimeout(() => {
    $_(`#eject_${num}`).style.color = "rgba(0, 0, 0, 0.5)";
    $_(`#eject_${num}`).style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    $_(`#eject_${num}`).innerHTML = "Eject ⏏";
  }, 2000);
  return;
};

// Save settings request
const saveSettings = (settingsValues) => {
  $_("#submit").innerHTML = "Saving";
  const request = new XMLHttpRequest();
  request.open("post", "savesettings/");
  request.send(settingsValues);
  request.onreadystatechange = () => {
    if (request.readyState == 4) {
      if (request.status == 200) saveSettingsSuccess(settingsValues.get("name"));
      else saveSettingsError();
    }
  };
};
const saveSettingsSuccess = (name) => {
  $_("#submit").value = "Saved";
  $_("#submit").style.backgroundColor = "#087f23";
  $_("#settings-form").reset();
  $_("#name").setAttribute("placeholder", name);
  welcome(name);
  setTimeout(() => {
    $_("#submit").value = "Save";
    $_("#submit").style.backgroundColor = "#c79100";
  }, 2000);
};
const saveSettingsError = () => {
  $_("#submit").value = "Error";
  $_("#submit").style.backgroundColor = "#ba000d";
  $_("#settings-form").reset();
  setTimeout(() => {
    $_("#submit").value = "Save";
    $_("#submit").style.backgroundColor = "#c79100";
  }, 2000);
};

// Settings form
$_("#settings-form").addEventListener("submit", (e) => {
  let settingsValues = new FormData($_("#settings-form"));
  if (
    (settingsValues.get("interface") == "<%= iface %>" || !settingsValues.get("interface")) &&
    !settingsValues.get("hostname") &&
    !settingsValues.get("name") &&
    !settingsValues.get("password")
  ) {
    e.preventDefault();
    return;
  } else if (settingsValues.get("interface") || settingsValues.get("hostname")) {
    const rebootCofirm = window.confirm(
      "One or more of the settings you changed will cause the device to reboot. Continue?",
    );
    if (rebootCofirm) {
      saveSettings(settingsValues);
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else {
      $_("#settings-form").reset();
    }
  } else {
    saveSettings(settingsValues);
  }
  e.preventDefault();
});
