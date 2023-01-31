require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {createOrganization, findUserInOrganizations, getUsersInOrganization, addUserToOrganization} = require("./database/organization");
const {createUser, updateUser, deleteUser} = require("./database/user");
const {getCompanyProjects, getUserProjects, getUsersInProject, createProject, updateProject, deleteProject} = require("./database/project");
const {getAllUserReports, getLastUserReport, createPersonalReport, updatePersonalReport, deletePersonalReport} = require("./database/personal-report");
const {getAllProjectCards, getAllCurrentUserCards, getAllUserCardsForTommorow, createCard, updateCard, deleteCard} = require("./database/card");

var serviceAccount = require("./firebaseAccountKey.json");
const { json } = require("body-parser");

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
  if (req.query.organizationId) {
    const organizationId = req.query.organizationId;
    console.log(organizationId);
    const result = await getUsersInOrganization(organizationId);
    res.status(200).json(result).end();
  } else if (req.query.projectId) {
    const projectId = req.query.projectId;
    console.log(projectId);
    const result = await getUsersInProject(projectId);
    res.status(200).json(result).end();
  }
  res.status(500).end();
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
  if (req.query.organization) {
    const organizationId = req.query.organization;
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

app.get("/api/person-reports", async (req, res) => {
  if(req.query.userId){
    const userId = req.query.userId;
    console.log(userId);
    const result = await getAllUserReports(userId);
    console.log(result);
    res.status(200).json(result).end();
  }
})

app.post("/api/person-report", async (req, res) => {
  const newReport = req.body;
  console.log(newReport);
  const result = await createPersonalReport(newReport);
  res.status(200).json(result).end();
})

app.post("/api/new-person-report", async (req, res) => {
  const newReport = req.body;
  console.log(newReport);
  const result = await createNewPersonalReport(newReport);
  res.status(200).json(result).end();
});

app.put("/api/person-report", async (req, res) => {
  const updatedReport = req.body;
  const result = await updatePersonalReport(updatedReport);
  console.log(result);
  res.status(200).json(result).end();
});

app.delete("/api/person-report", async (req, res) => {
  const reportId = req.query.reportId;
  console.log(reportId);
  const result = await deletePersonalReport(reportId);
  res.status(200).json(result).end();
})

app.get("/api/projects-tasks", async (req, res) => {
  if (req.query.user) {
    const userId = req.query.user;
    const projects = await getUserProjects(userId);
    const lastReport = await getLastUserReport(userId);
    const planedTasks = lastReport.tasks.filter((task) => task.status === "toDo");
    res.status(200).json({
      projects: projects,
      planedTasks: planedTasks
    }).end();
  }
  res.status(500).end();
});

app.get("/api/cards", async (req, res) => {
  if(req.query.projectId){
    const projectId = req.query.projectId;
    const cards = await getAllProjectCards(projectId);
    res.status(200).json(cards).end();
  }else if(req.query.userId && req.query.date){
    const userId = req.query.userId;
    const date = req.query.date;
    const currentCards = await getAllCurrentUserCards(userId, date);
    const planedCards = await getAllUserCardsForTommorow(userId, date);
    console.log(planedCards);
    res.status(200).json({"currentCards": currentCards, "planedCards": planedCards}).end();
  }
  res.status(500).end();
})

app.post("/api/card", async (req, res) => {
  const newCard = req.body;
  const result = await createCard(newCard);
  const projectId = newCard.project;
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
})

app.put("/api/card", async (req, res) => {
  const updatedCard = req.body;
  const result = await updateCard(updatedCard);
  const projectId = result.project;
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
});

app.delete("/api/card", async (req, res) => {
  const cardId = req.query.cardId;
  const projectId = req.query.projectId;
  const result = await deleteCard(cardId);
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT} ...`);
});
