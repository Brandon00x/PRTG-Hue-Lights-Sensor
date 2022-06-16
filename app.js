#!/usr/bin/env node

const http = require("http");
const axios = require("axios");
const config = require("./config");
const lights = require("./lights");

//To Get Light Numbers and Auth Tokens See: https://developers.meethue.com/develop/get-started-2/
const hueToken = config.hueToken; //Hue Auth Token
const hueAddress = config.hueAddress; //Hue IP Address. Example Format: http://10.10.10.95:80
const lightsArray = lights(); //Comes from lights.js file.

const numberOfLights = 10; //Change this the number of lights you have in lightsArray
let returnArray = []; //Empty Array to Push Values

const getData = async () => {
  returnArray = [];
  let url = `${hueAddress}/api/${hueToken}/lights/`;
  try {
    for (key in lightsArray) {
      const { data } = await axios.get(url + lightsArray[key]);
      try {
        returnData = {
          channel: key,
          value: data.state.on,
          state: data.state.on,
        };
        console.log(returnData.value);
        if (returnData.value === true) {
          returnData.value = 1;
          returnData.state = "On";
        } else {
          returnData.value = 0;
          returnData.state = "Off";
        }
      } catch (err) {
        console.log(`Light ${lightsArray[key]} was not found. Error: ${err}`);
      }

      returnArray.push(returnData);
    }
  } catch (err) {
    console.error(err);
  }
};

const createServer = async () => {
  const server = http.createServer((req, res) => {
    if (req.url !== "/lightstatus" || req.method !== "GET") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404");
    }
    let returnData = getData();
    returnData.then(() => {
      const returnValue = { result: returnArray };
      const prtg = { prtg: returnValue };
      console.log(JSON.stringify(prtg) + "\n");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(prtg));
      res.end();
    });
  });
  server.listen(8082, () =>
    console.log("Light Status Server Listening on 8082.")
  );
};
createServer();
