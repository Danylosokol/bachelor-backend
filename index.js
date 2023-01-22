require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {createOrganization, findUserInOrganizations, getUsersInOrganization, addUserToOrganization} = require("./database/organization");
const {createUser, updateUser, deleteUser} = require("./database/user");
const {getCompanyProjects, createProject, updateProject, deleteProject} = require("./database/project");

var serviceAccount = require("./firebaseAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/auth", async (req, res) => {
  const idToken = req.body.idToken;
  getAuth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
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

app.post("/api/organization", async (req, res) => {
  const name = req.body.name;
  let memebers = req.body.members;
  memebers.push({
    name: req.body.creator.displayName,
    email: req.body.creator.email,
    role: "creator",
  });
  const newOrganization = {
    name: name,
    members: memebers,
  };
  await createOrganization(newOrganization);
  res.status(200).end();
})

app.get("/api/users", async (req, res) => {
  const organizationId = req.query.id;
  console.log(organizationId);
  const result = await getUsersInOrganization(organizationId);
  res.status(200).json(result).end();
});

app.post("/api/user", async (req, res) => {
  const newUser = req.body;
  console.log(newUser);
  const result = await createUser(newUser);
  await addUserToOrganization(result._id, newUser.organizationId);
  res.status(200).json(result).end();
});

app.put("/api/user", async (req, res) => {
  const updatedUser = req.body;
  const result = await updateUser(updatedUser);
  res.status(200).json(result).end();
});

app.delete("/api/user", async (req, res) => {
  const userId = req.query.userId;
  const organizationId = req.query.organizationId;
  const result = await deleteUser(userId, organizationId);
  res.status(200).json(result).end();
});

app.get("/api/project", async (req, res) => {
  const organizationId = req.query.organization;
  if (organizationId) {
    const result = await getCompanyProjects(organizationId);
    console.log(result);
    res.status(200).json(result).end();
  }
  res.status(500).end();
});

app.post("/api/project", async (req, res) => {
  const newProject = req.body;
  const result = await createProject(newProject);
  res.status(200).json(result).end();
});

app.put("/api/project", async (req, res) => {
  const updatedProject = req.body;
  const result = await updateProject(updatedProject);
  console.log(result);
  res.status(200).json(result).end();
});

app.delete("/api/project", async (req, res) => {
  const projectId = req.query.id;
  const result = await deleteProject(projectId);
  res.status(200).json(result).end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT} ...`);
});
