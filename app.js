const express = require("express");
const app = express();
const DSC = require("./dsc")
const dsc = new DSC("YOUR GENESIS NODE", "YOUR ADMIN TOKEN")
const rp = require("request-promise");

//CENTRAL NODES API

app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.listen("3000", ()=>{
    console.log("Database UP")
})

app.post("/node", (req, res)=>{
    res.send (dsc.addNode("http://"+req.body.node));
})

app.post("/dsc", (req, res)=>{
    res.send(dsc.updatedsc(req.body.genesisNode, req.body.adminToken, req.body.data, req.body.nodes, req.body.tokens, req.body.tk, req.body.backup));
})

app.post("/relay", (req, res)=>{
    const options = {
        uri : req.body.uri+"/dsc",
        method : "post",
        json: true,
        body: {
            genesisNode: dsc.genesisNode,
            adminToken: dsc.adminToken,
            data: dsc.data,
            nodes: dsc.nodes,
            tokens: dsc.tokens,
            tk: req.body.tk,
            backup: dsc.backup
        }
    }

    rp(options).then(response => res.send(response))
})


app.post("/data", (req, res)=>{
    
    //console.log(req.body)

    res.send(dsc.addData(req.body, req.body.token))
})


app.get("/data", (req, res)=>{
    //console.log("Search command")
    res.send(dsc.getData(req.body.label, req.body.token));
})

app.get("/backups", (req, res)=>{

    if(dsc.searchToken(req.body.token)){
        res.send(dsc.backup);
    }else{
        res.send("INVALID TOKEN")
    }

    
})

app.post("/backup", (req, res)=>{
 res.send(dsc.addBackup(req.body.backup, req.body.adminToken));
})

app.post("/token", (req, res)=>{
    const tk = req.body.tk;
    const adminToken = req.body.adminToken;

    res.send(dsc.addToken(tk, adminToken))
})
