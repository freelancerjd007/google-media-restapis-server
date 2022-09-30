const fetch = require("node-fetch");
const { google } = require("googleapis");

var LocalStorage = require("node-localstorage").LocalStorage;
exports.localStorage = new LocalStorage("./scratch");

exports.getLocalStorageItems = () => {
  const accessToken = this.localStorage.getItem("accessToken");
  const expirationDate = this.localStorage.getItem("expirationDate");
  const refreshToken = this.localStorage.getItem("refreshToken");
  return {
    accessToken,
    expirationDate,
    refreshToken,
  };
};

exports.newExpirationDate = () => {
  var expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  return expiration;
};

exports.tokenExpired = () => {
  const now = new Date().getTime();
  const expirationDate = this.localStorage.getItem("expirationDate");
  const expDate = new Date(expirationDate).getTime();
  if (now > expDate) {
    return true; // token expired
  }
  return false; // valid token
};

exports.createNewToken = async () => {
  const request = await fetch("https://www.googleapis.com/oauth2/v4/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: this.localStorage.getItem("refreshToken"),
      grant_type: "refresh_token",
    }),
  });
  const data = await request.json();
  this.localStorage.setItem("accessToken", data.access_token);
  this.localStorage.setItem("expirationDate", this.newExpirationDate());
  if (data?.refresh_token) {
    this.localStorage.setItem("refreshToken", data.refresh_token);
  }
};
