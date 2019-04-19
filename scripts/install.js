const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const extract = require("extract-zip");

const { WIDEVINECDM_VERSION } = require("../src/constants");
const SYSTEM_ARCH = os.arch();
const SYSTEM_PLATFORM = os.platform();

console.log(
  `Downloading Widevine Version ${WIDEVINECDM_VERSION} for Arch ${SYSTEM_ARCH}...`
);

// Determine The Download URL based On Your System
var DOWNLOAD_URL = "";
switch (SYSTEM_PLATFORM) {
  case "linux":
    DOWNLOAD_URL = `https://dl.google.com/widevine-cdm/${WIDEVINECDM_VERSION}-linux-${SYSTEM_ARCH}.zip`;
  case "darwin":
    DOWNLOAD_URL = `https://dl.google.com/widevine-cdm/${WIDEVINECDM_VERSION}-mac-${SYSTEM_ARCH}.zip`;
  case "win32":
    DOWNLOAD_URL = `https://dl.google.com/widevine-cdm/${WIDEVINECDM_VERSION}-win-${SYSTEM_ARCH}.zip`;
}

// Download Widevine
const zipDest = path.join(
  os.tmpdir(),
  `widevinecdm-${process.pid}-${Date.now()}.zip`
);
const widevineDest = path.resolve(__dirname, "widevine");

const file = fs.createWriteStream(zipDest);
https
  .get(DOWNLOAD_URL, response => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        // close() is async, call function after close completes.
        extract(zipDest, { dir: widevineDest }, err => {
          fs.unlinkSync(zipDest);
          if (err) {
            console.error("Error extracting Widevine. Error: ", err);
            return;
          }

          console.log("Retrieved Widevine Successfully");
        });
      });
    });
  })
  .on("error", err => {
    fs.unlinkSync(zipDest); // Delete the file async. (But we don't check the result)
    console.error("Error downloading Widevine. Error: ", err);
  });
