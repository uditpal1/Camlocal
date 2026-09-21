/*
|--------------------------------------------------------------------------
| LOCAL TELEGRAM CAMERA TEST
|--------------------------------------------------------------------------
|
| URL:
|
| http://localhost:8000/?chat=123456789
|
|--------------------------------------------------------------------------
*/


// ============================================================
// CHAT ID
// ============================================================

const params =
  new URLSearchParams(
    window.location.search
  );


// Dynamic Chat ID

const chatId =
  params.get("chat");


// ============================================================
// HTML ELEMENTS
// ============================================================

const video =
  document.getElementById("camera");

const allowBtn =
  document.getElementById("allowBtn");

const captureBtn =
  document.getElementById("captureBtn");

const sendBtn =
  document.getElementById("sendBtn");

const status =
  document.getElementById("status");

const countdown =
  document.getElementById("countdown");

const photosSection =
  document.getElementById(
    "photosSection"
  );

const photosContainer =
  document.getElementById("photos");


// ============================================================
// VARIABLES
// ============================================================

let cameraStream = null;

let capturedPhotos = [];


// ============================================================
// DEVICE INFORMATION
// ============================================================

function getDeviceName() {

  const ua =
    navigator.userAgent;


  if (
    /Android/i.test(ua)
  ) {

    return "Android device";

  }


  if (
    /iPhone|iPad|iPod/i.test(ua)
  ) {

    return "Apple mobile device";

  }


  if (
    /Windows/i.test(ua)
  ) {

    return "Windows device";

  }


  if (
    /Macintosh|Mac OS/i.test(ua)
  ) {

    return "Mac device";

  }


  if (
    /Linux/i.test(ua)
  ) {

    return "Linux device";

  }


  return "Unknown device";

}


// ============================================================
// BROWSER
// ============================================================

function getBrowser() {

  const ua =
    navigator.userAgent;


  if (
    ua.includes("Edg/")
  ) {

    return "Microsoft Edge";

  }


  if (
    ua.includes("Chrome/")
  ) {

    return "Google Chrome";

  }


  if (
    ua.includes("Firefox/")
  ) {

    return "Mozilla Firefox";

  }


  if (
    ua.includes("Safari/")
  ) {

    return "Safari";

  }


  return "Unknown";

}


// ============================================================
// NETWORK
// ============================================================

function getNetwork() {

  if (
    navigator.connection
  ) {

    return (
      navigator.connection.effectiveType ||
      "Available"
    );

  }


  return "Unavailable";

}


// ============================================================
// COLLECT DEVICE INFO
// ============================================================

function collectDeviceInfo() {

  return {

    device:
      getDeviceName(),

    browser:
      getBrowser(),

    platform:
      navigator.platform ||
      "Unknown",

    screen:
      `${screen.width} × ${screen.height}`,

    language:
      navigator.language ||
      "Unknown",

    network:
      getNetwork(),

    timestamp:
      new Date().toLocaleString()

  };

}


const deviceData =
  collectDeviceInfo();


// ============================================================
// DISPLAY DEVICE INFO
// ============================================================

document.getElementById(
  "deviceInfo"
).textContent =
  deviceData.device;


document.getElementById(
  "browserInfo"
).textContent =
  deviceData.browser;


document.getElementById(
  "platformInfo"
).textContent =
  deviceData.platform;


document.getElementById(
  "screenInfo"
).textContent =
  deviceData.screen;


document.getElementById(
  "languageInfo"
).textContent =
  deviceData.language;


document.getElementById(
  "networkInfo"
).textContent =
  deviceData.network;


document.getElementById(
  "timestampInfo"
).textContent =
  deviceData.timestamp;


// ============================================================
// CHAT ID CHECK
// ============================================================

if (!chatId) {

  status.textContent =
    "Chat ID missing. Add ?chat=YOUR_CHAT_ID to the URL.";

  allowBtn.disabled =
    true;

}


// ============================================================
// CAMERA PERMISSION
// ============================================================

allowBtn.addEventListener(
  "click",
  async () => {

    try {

      status.textContent =
        "Requesting camera permission...";


      cameraStream =
        await navigator.mediaDevices
          .getUserMedia({

            video: {

              facingMode: {
                ideal: "user"
              }

            },

            audio: false

          });


      video.srcObject =
        cameraStream;


      status.textContent =
        "Camera ready. Press Capture 3 Photos.";


      allowBtn.disabled =
        true;


      captureBtn.disabled =
        false;

    }

    catch (error) {

      console.error(error);

      status.textContent =
        "Camera permission denied or unavailable.";

    }

  }
);


// ============================================================
// CAPTURE 3 PHOTOS
// ============================================================

captureBtn.addEventListener(
  "click",
  async () => {

    captureBtn.disabled =
      true;


    capturedPhotos = [];


    photosContainer.innerHTML =
      "";


    photosSection.classList.add(
      "hidden"
    );


    for (
      let i = 0;
      i < 3;
      i++
    ) {

      if (i > 0) {

        await waitThreeSeconds();

      }


      const photo =
        await capturePhoto();


      capturedPhotos.push(
        photo
      );

    }


    status.textContent =
      "3 photos captured. Review them before sending.";


    displayPhotos();


    photosSection.classList.remove(
      "hidden"
    );

  }
);


// ============================================================
// WAIT 3 SECONDS
// ============================================================

function waitThreeSeconds() {

  return new Promise(
    (resolve) => {

      let seconds = 3;


      countdown.textContent =
        seconds;


      const timer =
        setInterval(
          () => {

            seconds--;


            if (
              seconds <= 0
            ) {

              clearInterval(
                timer
              );


              countdown.textContent =
                "";


              resolve();

            }

            else {

              countdown.textContent =
                seconds;

            }

          },
          1000
        );

    }
  );

}


// ============================================================
// CAPTURE PHOTO
// ============================================================

function capturePhoto() {

  return new Promise(
    (resolve, reject) => {

      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        video.videoWidth;


      canvas.height =
        video.videoHeight;


      const context =
        canvas.getContext(
          "2d"
        );


      context.translate(
        canvas.width,
        0
      );


      context.scale(
        -1,
        1
      );


      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );


      canvas.toBlob(
        (blob) => {

          if (!blob) {

            reject(
              new Error(
                "Image creation failed."
              )
            );

            return;

          }


          resolve(blob);

        },

        "image/jpeg",

        0.88

      );

    }
  );

}


// ============================================================
// DISPLAY PHOTOS
// ============================================================

function displayPhotos() {

  photosContainer.innerHTML =
    "";


  capturedPhotos.forEach(
    (photo) => {

      const image =
        document.createElement(
          "img"
        );


      image.src =
        URL.createObjectURL(
          photo
        );


      photosContainer.appendChild(
        image
      );

    }
  );

}


// ============================================================
// SEND TO TELEGRAM
// ============================================================

sendBtn.addEventListener(
  "click",
  async () => {

    if (!chatId) {

      alert(
        "Chat ID is missing."
      );

      return;

    }


    if (
      capturedPhotos.length !== 3
    ) {

      alert(
        "Three photos are required."
      );

      return;

    }


    if (
      !BOT_TOKEN ||
      BOT_TOKEN ===
      "PASTE_YOUR_BOT_TOKEN_HERE"
    ) {

      alert(
        "Add your Telegram Bot Token in config.js first."
      );

      return;

    }


    sendBtn.disabled =
      true;


    sendBtn.textContent =
      "Sending...";


    try {

      // ------------------------------------------------------
      // Send device information
      // ------------------------------------------------------

      const message =

`📷 Camera Test

📱 Device: ${deviceData.device}

🌐 Browser: ${deviceData.browser}

⚙️ Platform: ${deviceData.platform}

📐 Screen: ${deviceData.screen}

🌍 Language: ${deviceData.language}

📡 Network: ${deviceData.network}

🕒 Timestamp: ${deviceData.timestamp}

📸 Photos: 3`;


      const messageResponse =
        await fetch(

          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                chat_id:
                  chatId,

                text:
                  message

              })

          }

        );


      const messageResult =
        await messageResponse.json();


      if (
        !messageResult.ok
      ) {

        throw new Error(
          "Device information could not be sent."
        );

      }


      // ------------------------------------------------------
      // Send photos
      // ------------------------------------------------------

      for (
        let i = 0;
        i < capturedPhotos.length;
        i++
      ) {

        const formData =
          new FormData();


        formData.append(
          "chat_id",
          chatId
        );


        formData.append(
          "photo",
          capturedPhotos[i],
          `camera-${i + 1}.jpg`
        );


        const response =
          await fetch(

            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,

            {

              method:
                "POST",

              body:
                formData

            }

          );


        const result =
          await response.json();


        if (!result.ok) {

          throw new Error(
            "Photo could not be sent."
          );

        }

      }


      status.textContent =
        "Device information and 3 photos sent successfully.";


      sendBtn.textContent =
        "Sent to Telegram";

    }

    catch (error) {

      console.error(error);


      status.textContent =
        "Something went wrong while sending.";


      sendBtn.disabled =
        false;


      sendBtn.textContent =
        "Send to Telegram";

    }

  }
);


// ============================================================
// STOP CAMERA WHEN PAGE CLOSES
// ============================================================

window.addEventListener(
  "beforeunload",
  () => {

    if (!cameraStream) {
      return;
    }


    cameraStream
      .getTracks()
      .forEach(
        (track) => {

          track.stop();

        }
      );

  }
);
