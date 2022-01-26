const http = require("http");
const axios = require('axios');
//To Get Light Numbers and Auth Tokens See: https://developers.meethue.com/develop/get-started-2/
const hueToken = "<Hue Auth Token Goes Here>"; //Hue Auth Token
const hueAddress = "http://10.10.10.95:80"; //Hue IP Address. Example Format: http://10.10.10.95:80
const lightsArray = { //Light Numbers and Names From Hue API
    "Bathroom1": 1,
    "Bathroom2": 2, 
    "Bathroom3": 3, 
    "Bathroom4": 4, 
    "Bedroom1": 7, 
    "LivingRoom": 8, 
    "Bedroom2": 11, 
    "Basement": 12, 
    "Basement2": 13, 
    "Bedroom3": 14
};
const numberOfLights = 10 //Change this the number of lights you have in lightsArray
let returnArray = []; //Empty Array to Push Values

const getData = async () => {
    let url = `${hueAddress}/api/${hueToken}/lights/`
    for (key in lightsArray){
        const {data} = await axios.get(url + lightsArray[key])
        returnData = {channel: key, value: data.state.on, state: data.state.on};
        if (returnData.value === true){
            returnData.value = 1;
            returnData.state = "On";
        }else {
            returnData.value = 0;
            returnData.state = "Off";
        }
        
        if (returnArray.length >= numberOfLights){
            returnArray = []
            returnArray.push(returnData);
        } else {
            returnArray.push(returnData);
        }
    }
}

const createServer = async () => {
    const server = http.createServer((req, res) => {
      if (req.url !== "/lightstatus" || req.method !== "GET") {
        res.writeHead(404, {"Content-Type": "text/plain"});
        return res.end("404");
      }
      let returnData = getData();
      returnData.then(() => {
        const returnValue = {result: returnArray}
        const prtg = {prtg: returnValue}
        console.log(JSON.stringify(prtg) + "\n");

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(prtg));
        res.end();
      })
    })
    server.listen(8081, () => console.log("Light Status Server Listening on 8081."));
}
createServer();