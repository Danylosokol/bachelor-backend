require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {} = require("./database/");

var serviceAccount = require("./astral-web-363306-firebase-adminsdk-f4t5l-206bdc76ab.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/auth", async (req, res) => {
  console.log(req.body);
  const idToken = req.body.idToken;
  getAuth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      console.log(decodedToken);
      const email = decodedToken.email;
      const user = await findUserInOrganizations(email);
      console.log("Result of database search");
      console.log(user);
      if (!user) {
        console.log("New user...");
        res.status(200).json({ result: "New user" }).end();
      } else {
        res.status(200).json(user).end();
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error).end();
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT} ...`);
});
