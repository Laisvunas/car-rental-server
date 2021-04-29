const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require ("dotenv").config();

const mysqlConfig = {
    user: process.env.MYSQL_USER,    
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT
};

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send({message: "Server running successfully"});
});

app.get("/models", async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [data] = await con.execute(`SELECT * FROM models`);
        con.end();
        return res.send(data);
    } catch(err) {
        console.log(err);
        return res.status(500).send ({error: "Unexpected error has ocurred. Please try again later"}); 
    }
});

app.get("/vehicles", async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [data] = await con.execute(`SELECT models.name, models.hour_price, vehicles.number_plate, vehicles.country_location FROM models INNER JOIN vehicles ON models.id = vehicles.model_id`);
        con.end();
        return res.send(data);
    } catch(err) {
        console.log(err);
        return res.status(500).send ({error: "Unexpected error has ocurred. Please try again later"}); 
    }
});

app.get("/vehicles/:country_location", async (req, res) => {
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [data] = await con.execute(`SELECT models.name, models.hour_price, vehicles.number_plate, vehicles.country_location FROM models INNER JOIN vehicles ON models.id = vehicles.model_id WHERE vehicles.country_location = '${req.params.country_location}'`);
        con.end();
        return res.send(data);
    } catch(err) {
        console.log(err);
        return res.status(500).send ({error: "Unexpected error has ocurred. Please try again later"}); 
    }
});

app.post("/models", async (req, res) => {
    if (!req.body.name || !req.body.hour_price) {
        return res.status(400).send({error: "Incorrect data has been passed"});
    }
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [result] = await con.execute (`INSERT INTO models (name, hour_price) VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(req.body.hour_price)})`);
        con.end();
        if(!result.insertId) {
            return res.status(500).send({ error: "Execution failed. Please contact admin" });
        }
        return res.send({ id: result.insertId});
    } catch (err) {
        console.log(err);
        return res.status(500).send ({error: "Unexpected error has ocurred. Please try again later"});
    }
});

app.post("/vehicles", async (req, res) => {
    if (!req.body.model_id || !req.body.number_plate || !req.body.country_location) {
        return res.status(400).send({error: "Incorrect data has been passed"});
    }
    try {
        const con = await mysql.createConnection(mysqlConfig);
        const [result] = await con.execute (`INSERT INTO vehicles (model_id, number_plate, country_location) VALUES (${mysql.escape(req.body.model_id)}, ${mysql.escape(req.body.number_plate)}, ${mysql.escape(req.body.country_location)})`);
        con.end();
        if(!result.insertId) {
            return res.status(500).send({ error: "Execution failed. Please contact admin" });
        }
        return res.send({ id: result.insertId});
    } catch (err) {
        console.log(err);
        return res.status(500).send ({error: "Unexpected error has ocurred. Please try again later"});
    }
});

app.all("*", (req, res) => {
    return res.status(400).send({error: "Page not found"});
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}`));