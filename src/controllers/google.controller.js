const { google } = require("googleapis");
const fetch = require("node-fetch");
const {
  localStorage,
  tokenExpired,
  createNewToken,
  getLocalStorageItems,
  newExpirationDate,
} = require("../utils");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_BASE_URL}/google/handleGoogleRedirect` // server redirect url handler
);

exports.createAuthLink = async (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/photoslibrary.readonly",
    ],
    prompt: "consent",
  });
  if (url) {
    res.status(200).json({
      status: "1",
      message: "OAuth2 url generated successfully.",
      url,
    });
  } else {
    res.status(422).json({
      status: "0",
      message:
        "Something went wrong! OAuth2 url not generated please after sometime.",
      url: "",
    });
  }
};

exports.handleGoogleRedirect = async (req, res) => {
  oauth2Client.getToken(req.query.code, (err, tokens) => {
    if (err) {
      res.status(422).json({
        status: "0",
        message: "Issue with login",
        errorMsg: err.message,
      });
    }
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("expirationDate", newExpirationDate());
    localStorage.setItem("refreshToken", refreshToken);
    res.redirect(process.env.CLIENT_BASE_URL);
  });
};

exports.getValidToken = async (req, res) => {
  try {
    const request = await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: localStorage.getItem("refreshToken"),
        grant_type: "refresh_token",
      }),
    });
    const data = await request.json();
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("expirationDate", newExpirationDate());
    res.status(200).json({
      status: "1",
      message: "accessToken generated successfully.",
      accessToken: data.access_token,
    });
  } catch (error) {
    res.status(422).json({
      status: "0",
      message:
        "Something went wrong! accessToken not generated. please try after sometime.",
      errorMsg: error.message,
      accessToken: "",
    });
  }
};

exports.getMediaItems = async (req, res) => {
  try {
    if (tokenExpired()) {
      await createNewToken();
    }
    let response = await fetch(
      `${process.env.REACT_APP_GOOGLE_PHOTOS_REST_API_BASE_URL}/v1/mediaItems`,
      {
        headers: {
          Authorization: `Bearer ${getLocalStorageItems().accessToken}`,
        },
      }
    );
    response = await response.json();
    res.status(200).json({
      status: "1",
      message: "Google Photos fetched successfully",
      data: response?.mediaItems || [],
    });
  } catch (error) {
    res.status(422).json({
      status: "0",
      message: error.message,
      data: [],
    });
  }
};
