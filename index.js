require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {
  createOrganization,
  findUserInOrganizations,
  getUsersInOrganization,
  addUserToOrganization,
  deleteOrganization,
} = require("./database/organization");
const { createUser, updateUser, deleteUser } = require("./database/user");
const {
  getCompanyProjects,
  getUserProjects,
  getUsersInProject,
  createProject,
  updateProject,
  deleteProject,
} = require("./database/project");
const {
  getAllPersonalReports,
  getAllPersonalReportsByDate,
  getAllUserReports,
  getPlanedCustomFeedbacks,
  getOwnFeedbacks,
  createPersonalReport,
  updatePersonalReport,
  deletePersonalReport,
} = require("./database/personal-report");
const {
  getAllProjectCards,
  getAllCurrentUserCards,
  getAllUserCardsForNextDay,
  getCurrentCardsAndFeedbacks,
  getPlanedProjectCards,
  createCard,
  updateCard,
  deleteCard,
} = require("./database/card");
const {
  getAllProjectReports,
  getAllOrganizationReports,
  createProjectReport,
  updateProjectReport,
  deleteProjectReport,
} = require("./database/project-report.js");
const { personReportsToFeedbacks } = require("./database/transformations.js");
const { summarization } = require("./nlp/summarization.js");
const { createRegexes } = require("./nlp/keywords.js");

var serviceAccount = require("./firebaseAccountKey.json");
const {
  getAllKeywords,
  updateKeywords,
  createKeywords,
} = require("./database/keyword");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initializes a new Express application
const app = express();
// This allows the server to accept requests from different domains.
app.use(cors());
// The server can handle JSON data sent in the body of HTTP requests.
app.use(express.json());
// This allows the server to handle URL-encoded data sent in the body of HTTP requests. The "extended: false" option means that the value of the data can be any type.
app.use(bodyParser.urlencoded({ extended: false }));

// Route for authentication
app.post("/api/auth", async (req, res) => {
  const idToken = req.body.idToken;
  // Verifies the idToken using the getAuth function from firebase API
  getAuth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const email = decodedToken.email;
      // Searches the database for a user in the organization with this email
      const user = await findUserInOrganizations(email);
      // If the user is not found, responds with a 'New user' message
      if (!user) {
        res.status(200).json({ result: "New user" }).end();
      } else {
        res.status(200).json(user).end();
      }
    })
    .catch((error) => {
      // Logs the error and sends it in the response if something goes wrong
      console.log(error);
      res.status(500).json(error).end();
    });
});

// Route for creating a new organization
app.post("/api/organization", async (req, res) => {
  const name = req.body.name;
  let memebers = req.body.members;
  // Adds the creator as a member with the role 'creator'
  memebers.push({
    name: req.body.creator.displayName,
    email: req.body.creator.email,
    role: "creator",
  });
  // Creates a new organization object
  const newOrganization = {
    name: name,
    members: memebers,
  };
  // Stores the new organization in the database
  const organization = await createOrganization(newOrganization);
  // Creates an keywords object associated with this organization that will contain basic predefined dictionary with keywords
  const keywords = {
    organization: organization._id,
    options: "mi",
  };
  await createKeywords(keywords);
  res.status(200).end();
});

// Route for getting users
app.get("/api/users", async (req, res) => {
  if (req.query.organizationId) {
    // If an organizationId is provided, get users in that organization
    const organizationId = req.query.organizationId;
    console.log(organizationId);
    const result = await getUsersInOrganization(organizationId);
    res.status(200).json(result).end();
  } else if (req.query.projectId) {
    // If a projectId is provided, get users in that project
    const projectId = req.query.projectId;
    console.log(projectId);
    const result = await getUsersInProject(projectId);
    res.status(200).json(result).end();
  }
  // If neither an organizationId nor a projectId is provided, end the response with a status code of 500
  res.status(500).end();
});

// Route for creating a new user
app.post("/api/user", async (req, res) => {
  const newUser = req.body;
  console.log(newUser);
  // Stores the new user in the database
  const result = await createUser(newUser);
  // Adds the new user to the specified organization
  await addUserToOrganization(result._id, newUser.organizationId);
  res.status(200).json(result).end();
});

// Route for updating a user
app.put("/api/user", async (req, res) => {
  const updatedUser = req.body;
  // Updates the user in the database
  const result = await updateUser(updatedUser);
  res.status(200).json(result).end();
});

// Route for deleting a user
app.delete("/api/user", async (req, res) => {
  const userId = req.query.userId;
  const organizationId = req.query.organizationId;
  // Deletes the user and remove from the specified organization
  const result = await deleteUser(userId, organizationId);
  res.status(200).json(result).end();
});

// Route for getting a project
app.get("/api/project", async (req, res) => {
  if (req.query.organization) {
    // If an organization is provided, gets the projects of that organization
    const organizationId = req.query.organization;
    const result = await getCompanyProjects(organizationId);
    console.log(result);
    res.status(200).json(result).end();
  } else if (req.query.userId) {
    // If a userId is provided, gets the projects of that user
    const userId = req.query.userId;
    const result = await getUserProjects(userId);
    res.status(200).json(result).end();
  }
  // If neither an organization nor a userId is provided, ends the response with a status code of 500
  res.status(500).end();
});

// Route for creating a new project
app.post("/api/project", async (req, res) => {
  const newProject = req.body;
  // Stores the new project in the database
  const result = await createProject(newProject);
  // Ends the response with the new project's data
  res.status(200).json(result).end();
});

// Route for updating a project
app.put("/api/project", async (req, res) => {
  const updatedProject = req.body;
  // Updates the project in the database
  const result = await updateProject(updatedProject);
  // Ends the response with the updated project's data
  res.status(200).json(result).end();
});

// Route for deleting a project
app.delete("/api/project", async (req, res) => {
  const projectId = req.query.id;
  // Deletes the project from the database
  const result = await deleteProject(projectId);
  res.status(200).json(result).end();
});

// Route for getting person reports
app.get("/api/person-reports", async (req, res) => {
  if (req.query.userId && req.query.userId !== "all") {
    // If a specific userId is provided, gets all reports of that user
    const userId = req.query.userId;
    const result = await getAllUserReports(userId);
    res.status(200).json(result).end();
  } else if (
    req.query.userId &&
    req.query.userId === "all" &&
    req.query.organizationId
  ) {
    // If 'all' is specified for userId and an organizationId is provided, gets all personal reports of that organization
    const organizationId = req.query.organizationId;
    const result = await getAllPersonalReports(organizationId);
    res.status(200).json(result).end();
  } else if (req.query.date && req.query.organizationId) {
    // If a date and an organizationId are provided, gets all personal reports of that organization for the specified date
    const result = await getAllPersonalReportsByDate(
      req.query.date,
      req.query.organizationId
    );
    console.log(result);
    res.status(200).json(result).end();
  }
});

// Route for creating a new person report
app.post("/api/person-report", async (req, res) => {
  const newReport = req.body;
  // Stores the new report in the database
  const result = await createPersonalReport(newReport);
  res.status(200).json(result).end();
});

// Route for updating a person report
app.put("/api/person-report", async (req, res) => {
  const updatedReport = req.body;
  // Updates the report in the database
  const result = await updatePersonalReport(updatedReport);
  res.status(200).json(result).end();
});

// Route for deleting a person report
app.delete("/api/person-report", async (req, res) => {
  const reportId = req.query.reportId;
  // Deletes the report from the database
  const result = await deletePersonalReport(reportId);
  res.status(200).json(result).end();
});

// Route for getting cards
app.get("/api/cards", async (req, res) => {
  if (req.query.projectId) {
    // If a projectId is provided, gets all the cards of that project
    const projectId = req.query.projectId;
    const cards = await getAllProjectCards(projectId);
    res.status(200).json(cards).end();
  } else if (req.query.userId && req.query.date) {
    // If a userId and a date are provided, gets all current, planned and own planed cards of that user for the specified date to create a personal report
    const userId = req.query.userId;
    const date = req.query.date;
    const currentCards = await getAllCurrentUserCards(userId, date);
    const planedCards = await getAllUserCardsForNextDay(userId, date);
    const planedCustomFeedbacks = await getPlanedCustomFeedbacks(userId);
    res
      .status(200)
      .json({
        currentCards: currentCards,
        planedCards: planedCards,
        planedCustomFeedbacks: planedCustomFeedbacks,
      })
      .end();
  }
  // If neither a projectId nor a userId with a date are provided, ends the response with a status code of 500
  res.status(500).end();
});

// Route for creating a new card
app.post("/api/card", async (req, res) => {
  const newCard = req.body;
  // Stores the new card in the database
  const result = await createCard(newCard);
  // After creating the card, gets all the cards of the project the new card belongs to
  const projectId = newCard.project;
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
});

// Route for updating a card
app.put("/api/card", async (req, res) => {
  const updatedCard = req.body;
  // Updates the card in the database
  const result = await updateCard(updatedCard);
  // After updating the card, gets all the cards of the project the updated card belongs to
  const projectId = result.project;
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
});

// Route for deleting a card
app.delete("/api/card", async (req, res) => {
  const cardId = req.query.cardId;
  const projectId = req.query.projectId;
  // Deletes the card from the database
  const result = await deleteCard(cardId);
  // After deleting the card, gets all the cards of the project the deleted card belonged to
  const updatedCards = await getAllProjectCards(projectId);
  res.status(200).json(updatedCards).end();
});

// Route for getting project reports
app.get("/api/project-reports", async (req, res) => {
  const projectId = req.query.projectId;
  // If projectId is 'all', it gets all the reports of the organization
  if (projectId === "all") {
    const organizationId = req.query.organizationId;
    const result = await getAllOrganizationReports(organizationId);
    res.status(200).json(result).end();
  } else if (projectId !== undefined && projectId !== null) {
    // If projectId is not undefined and not null, gets all the reports of that project
    const result = await getAllProjectReports(projectId);
    res.status(200).json(result).end();
  }
  res.status(500).end();
});

// Route for getting project cards, feedbacks and summarized feedbacks to create project report
app.get("/api/project-reports/cards-feedbacks", async (req, res) => {
  const startTimeStamp = req.query.startDay;
  const endTimeStamp = req.query.endDay;
  const projectId = req.query.projectId;
  const organizationId = req.query.organization;
  // Get cards that were active during setted period of time in the project and personal reports that have feedbacks written for this cards during setted period of time
  const queryResult = await getCurrentCardsAndFeedbacks(
    startTimeStamp,
    endTimeStamp,
    projectId
  );
  // Extract from personal reports that were found for cards only feedbacks
  const currentCards = personReportsToFeedbacks(queryResult);
  // Get keywords for summarization for this organization
  const keywords = await getAllKeywords(organizationId);
  // Create regex expresions from strings
  const regexes = keywords.keywords.map(
    (keyword) => new RegExp(keyword, keywords.options)
  );
  // Create summarization of found feedbacks
  const currentSummarized = await summarization(currentCards, regexes);
  // Get planed cards for the project
  const planedCards = await getPlanedProjectCards(endTimeStamp, projectId);
  // Get own cards created by users during setted period of time and assigned for this project
  const ownFeedbacks = await getOwnFeedbacks(
    startTimeStamp,
    endTimeStamp,
    projectId
  );
  res
    .status(200)
    .json({
      currentCards: currentSummarized,
      planedCards: planedCards,
      ownFeedbacks: ownFeedbacks,
    })
    .end();
});

// Route for creating a new project report
app.post("/api/project-report", async (req, res) => {
  const newReport = req.body;
  // Stores the new report in the database
  const result = await createProjectReport(newReport);
  res.status(200).json(result).end();
});

// Route for updating a project report
app.put("/api/project-report", async (req, res) => {
  const updatedReport = req.body;
  // Updates the report in the database
  const result = await updateProjectReport(updatedReport);
  res.status(200).json(result).end();
});

// Route for deleting a project report
app.delete("/api/project-report", async (req, res) => {
  const reportId = req.query.reportId;
  // Deletes the report from the database
  const result = await deleteProjectReport(reportId);
  res.status(200).json(result).end();
});

// Route for updating keywords for an organization
app.post("/api/keywords", async (req, res) => {
  const keywords = req.body.keywords;
  const organization = req.body.organization;
  // Updates the keywords in the database for the specified organization
  const regexes = await createRegexes(keywords);
  const result = regexes;
  await updateKeywords({ organization: organization, keywords: regexes });
  res.status(200).json(result).end();
});

// Route to delete organization and all data assosiated with it from the database
app.delete("/api/organization", async (req, res) => {
  const organizationId = req.query.organizationId;
  const result = deleteOrganization(organizationId);
  res.status(200).json({status: result}).end();
});

// Sets the PORT constant to either the environment's specified port or defaults to 8080
const PORT = process.env.PORT || 8080;
// Starts the server and listens on the specified port
app.listen(PORT, () => {
  console.log(`Server listen on http://localhost:${PORT} ...`);
});
