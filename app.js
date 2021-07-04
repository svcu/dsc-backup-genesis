const express = require("express");
const app = express();
const DSC = require("./dsc")
const dsc = new DSC("http://localhost:3000", "SLgamer12*")
const rp = require("request-promise");

//CENTRAL NODES API

app.use(express.json());
app.use(express.urlencoded({extended: true}))



app.listen("3000", ()=>{
    console.log("Database UP")
})

app.get("/", (req, res)=>{
    res.send("ONLINE")
})



app.post("/node", (req, res)=>{
    const tk = dsc.addNode("http://"+req.body.node);
    const backups = dsc.backup;
    const requests = [];

    backups.forEach(bc => {
        const options = {
            uri : bc+"/token",
            method : "post",
            json: true,
            body: {
                tk: tk,
                adminToken: dsc.adminToken
            }
        }

        requests.push(rp(options));
    })

    Promise.all(requests).then(res => console.log(res));

    res.send(tk)
})

app.post("/dsc", (req, res)=>{
    res.send(dsc.updateDJS(req.body.genesisNode, req.body.adminToken, req.body.data, req.body.nodes, req.body.tokens, req.body.tk, req.body.backup));
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

    console.log(options)

    

    rp(options).then(response => {
        dsc.addBackup(req.body.uri, req.body.tk);
        res.send(response)
    })
})


app.post("/data", (req, res)=>{
    
    console.log(req.body)

    res.send(dsc.addData(req.body, req.body.token, req.body.secret));
})


app.get("/data", (req, res)=>{
    //console.log("Search command")
    res.send(dsc.getData(req.body.label, req.body.token, req.body.secret));
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

app.post("/update", (req, res)=>{
    dsc.update(req.body.data, req.body.tk)
})

