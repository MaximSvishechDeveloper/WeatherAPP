import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY;

const app = express();
const port = 3000;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
    params: {
      q: "auto",
      days: "3",
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };
  try {
    await axios.request(options);
    res.render("index.ejs");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.post("/city", async (req, res) => {
  console.log(req.body.place);
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
    params: {
      q: req.body.place,
      days: "3",
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    const jsonData = response.data;
    res.render("index.ejs", { content: jsonData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.post("/current", async (req, res) => {
  const locationData = await getUserLocation();
  const city = locationData.city;
  const country = locationData.country;
  const ipAddress = req.ip;

  console.log('User IP:', ipAddress);
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
    params: {
      q: `${city},${country}`,
      days: "3",
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    const jsonData = response.data;
    res.render("index.ejs", { content: jsonData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

async function getUserLocation() {
  try {
    const response = await axios.get("https://ipinfo.io/json");
    const data = response.data;

    const { city, country } = data;
    return { city, country };
  } catch (error) {
    console.error("Error fetching location:", error.message);
  }
}
