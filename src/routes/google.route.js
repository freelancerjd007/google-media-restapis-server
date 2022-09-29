const router = require("express").Router();
const controller = require("../controllers/google.controller");

router.post("/createAuthLink", controller.createAuthLink);

router.get("/handleGoogleRedirect", controller.handleGoogleRedirect);

router.post("/getValidToken", controller.getValidToken);

module.exports = router;
