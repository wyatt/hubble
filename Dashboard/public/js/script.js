let info;

$(document).ready(() => {
  feather.replace();
  particlesJS.load("particles", "particles.json");
  info = window.info;
  $(`input[value=${info.iface}]`).attr("checked", true);
  welcome(info.name);
});

const welcome = (name) => {
  const hour = new Date().getHours();
  let period;
  if (hour >= 4 && hour <= 11) period = "morning";
  if (hour >= 12 && hour <= 16) period = "afternoon";
  if (hour >= 17) period = "evening";
  $("#welcome").html(`Good ${period}, ${name}`);
};

//Change pages
const settings = (value) => {
  if (value == "back") {
    $("#page1").css("display", "flex");
    $("#page2").css("display", "none");
    $("#settings-form").trigger("reset");
  } else {
    $("#page1").css("display", "none");
    $("#page2").css("display", "flex");
  }
};

//Terminal link
const terminal = () => {
  const port = $("#terminal").attr("port");
  window.alert("⚠ Please note: This tool is very powerful and should only be used if you know what you're doing!");
  window.location.href = window.location.origin + port;
};

//Change adapter
const adapter = () => {
  window.alert(
    "⚠ This device will now shutdown. Once the device is shutdown, change adapters and turn the plug on and off. If the adapter is supported, it should be working!",
  );
  $.post("/adapter");
};

//Interface sette

//Form submit
$("#settings-form").submit(function (e) {
  console.log("detected");
  let postData = $(this).serializeArray();
  let name = postData[0].value;
  let hostname = postData[1].value;
  let iface = postData[2].value;
  if (hostname === info.hostname) hostname = "";
  if (name == info.name) name = "";
  if (iface !== info.iface || hostname) {
    let reboot = window.confirm("One or more of the settings you changed will cause the device to reboot. Continue?");
    if (reboot) submit(postData);
  } else if (iface === info.iface && !hostname && !name) {
    e.preventDefault();
    return;
  } else {
    submit(postData);
    $("#name").attr("placeholder", name);
    welcome(name);
  }
  e.preventDefault();
});

const submit = (postData) => {
  $("input[type='submit']").val("Saving");
  $.ajax({
    url: "/savesettings",
    type: "POST",
    data: postData,
    success: () => {
      $("input[type='submit']").val("Saved");
      $("input[type='submit']").css("background-color", "#087f23");
      $("#settings-form").trigger("reset");
      setTimeout(() => {
        $("input[type='submit']").val("Save");
        $("input[type='submit']").css("background-color", "#c79100");
      }, 2000);
    },
    error: () => {
      $("input[type='submit']").val("Error");
      $("input[type='submit']").css("background-color", "#ba000d");
      $("#settings-form").trigger("reset");
      setTimeout(() => {
        $("input[type='submit']").val("Save");
        $("input[type='submit']").css("background-color", "#c79100");
      }, 2000);
    },
  });
};
