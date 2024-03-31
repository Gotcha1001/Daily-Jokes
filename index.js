import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";       //import environment variables   to install... npm i dotenv

const app = express();
const port = 3000;

env.config();    //using environment variables

app.set("view engine", "ejs"); // Set the view engine to EJS

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let simple = [];

//RENDER THE INDEX.EJS WITH THE DATA FROM THE DATABASE.. JOKES USED FOR THE FOR LOOP
app.get("/", async (req, res) => {
  try {
    //query the database and get jokes from database all
    const jokesResult = await db.query("SELECT * FROM simple ORDER BY id ASC");
    const jokes = jokesResult.rows;
    console.log(simple.rows);
    res.render("index.ejs", { jokes: jokes });
  } catch (error) {
    console.log(error);
  }
});

// Route for the Create page 
app.get("/create", (req, res) =>{
  res.render("create.ejs");
});



// Form Submission Handler  CREATE A JOKE
app.post("/add" , async (req, res) => {
  const {username, joke, picurl} = req.body;
  try {
    await db.query("INSERT INTO simple (username, joke, picURL) VALUES ($1, $2, $3)",
    [username, joke, picurl]);
    res.redirect("/");

  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding joke");
  }
});


//Route for the Modify page Note when loading existing data the modify.ejs needs the value attribute ejs
// also the route needs to point here but using ejs to get the id ..<form action="/modify/<%= joke.id %>" method="post">
app.get("/modify/:id", async (req, res) => {
  const jokeId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM simple WHERE id = $1", [jokeId]);
    console.log("Result:", result.rows);
    const joke = result.rows[0];
    res.render("modify.ejs", {joke: joke});

  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving joke data");
  }
});

//POST route for modyfying a joke to submit  .... note we use req.params.id .....not body
app.post("/modify/:id" , async (req, res) => {
  const jokeId = req.params.id;
  const {username, joke, picurl } = req.body;
  try {
    await db.query("UPDATE simple SET username = $1, joke = $2, picURL = $3 WHERE id = $4",
    [username, joke, picurl, jokeId]);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating joke");
  }
})

//DELETE a joke using the id
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM simple WHERE id = $1", [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
