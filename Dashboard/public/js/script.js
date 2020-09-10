let info = window.info;

//Helper code
const $ = (selector) => document.querySelectorAll(selector);
const $s = (selector) => document.querySelector(selector);

const isEmpty = (value) => {
  return value == null || value.length === 0;
};

//Functions
const welcome = (name) => {
  const hour = new Date().getHours();
  let period;
  if (hour >= 4 && hour <= 11) period = "morning";
  if (hour >= 12 && hour <= 16) period = "afternoon";
  if (hour >= 17) period = "evening";
  $s("#welcome").innerHTML = `Good ${period}, ${name}`;
};

const mounts = (devices) => {
  if (!devices) {
    return;
  }

  for (let i = 0; i < devices.length; i++) {
    $s("#noDevices").style.display = "none";
    $(".mount")[i].style.display = "flex";
    $(".mount p")[i].innerHTML = devices[i].mount_point.replace("/", "");
  }
};

const interfaces = (iface) => {
  if (iface) {
    $s(`input[value=${info.iface}]`).setAttribute("checked", true);
  } else {
    $s("#interface-message").innerHTML = "Interface not detected! <span id='iface-more-info'>More info</span>";
    $s("#iface-more-info").addEventListener("click", () => {
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
    $s(`#${parentpage}-page`).style.display = "flex";
    $s(`#${page}-page`).style.display = "none";
    $s("#settings-form").reset();
  } else {
    $s(`#${parentpage}-page`).style.display = "none";
    $s(`#${page}-page`).style.display = "flex";
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
$s("#settings").addEventListener("click", () => {
  pageToggle("", "settings");
});
$s("#back-settings").addEventListener("click", () => {
  pageToggle("back", "settings");
});
$s("#devices").addEventListener("click", () => {
  pageToggle("", "devices");
});
$s("#back-devices").addEventListener("click", () => {
  pageToggle("back", "devices");
});

//Settings buttons
$s("#adapter").addEventListener("click", () => {
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
$s("#terminal").addEventListener("click", () => {
  window.alert("⚠ Please note: This tool is very powerful and should only be used if you know what you're doing!");
  window.location.href = `${window.location.origin}:4200`;
});
$s("#reboot").addEventListener("click", () => {
  window.alert("⚠ This device will now reboot. Continue?");
  const request = new XMLHttpRequest();
  request.open("get", "reboot/");
  request.send();
});
$s("#shutdown").addEventListener("click", () => {
  window.alert("⚠ This device will now shutdown. Continue?");
  const request = new XMLHttpRequest();
  request.open("get", "shutdown/");
  request.send();
});

// Eject request
const eject = (num) => {
  $s(`#eject_${num}`).innerHTML = "Ejecting";
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
  $s(`#eject_${num}`).innerHTML = "Save to remove";
  $s(`#eject_${num}`).style.color = "white";
  $s(`#eject_${num}`).style.backgroundColor = "#087f23";
  setTimeout(() => {
    $s(`#eject_${num}`).parentElement.style.display = "none";
  }, 2000);
  return;
};
const ejectError = (num) => {
  $s(`#eject_${num}`).innerHTML = "Error";
  $s(`#eject_${num}`).style.color = "white";
  $s(`#eject_${num}`).style.backgroundColor = "#ba000d";
  setTimeout(() => {
    $s(`#eject_${num}`).style.color = "rgba(0, 0, 0, 0.5)";
    $s(`#eject_${num}`).style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    $s(`#eject_${num}`).innerHTML = "Eject ⏏";
  }, 2000);
  return;
};

// Save settings request
const saveSettings = (settingsValues) => {
  $s("#submit").innerHTML = "Saving";
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
  $s("#submit").value = "Saved";
  $s("#submit").style.backgroundColor = "#087f23";
  $s("#settings-form").reset();
  $s("#name").setAttribute("placeholder", name);
  welcome(name);
  setTimeout(() => {
    $s("#submit").value = "Save";
    $s("#submit").style.backgroundColor = "#c79100";
  }, 2000);
};
const saveSettingsError = () => {
  $s("#submit").value = "Error";
  $s("#submit").style.backgroundColor = "#ba000d";
  $s("#settings-form").reset();
  setTimeout(() => {
    $s("#submit").value = "Save";
    $s("#submit").style.backgroundColor = "#c79100";
  }, 2000);
};

// Settings form
$s("#settings-form").addEventListener("submit", (e) => {
  let settingsValues = new FormData($s("#settings-form"));
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
      $s("#settings-form").reset();
    }
  } else {
    saveSettings(settingsValues);
  }
  e.preventDefault();
});
