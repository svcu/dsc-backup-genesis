const rp = require("request-promise");
const SHA256 = require("crypto-js/sha256");
const cryptojs = require("crypto-js");
const AES = require("crypto-js/aes");

//CLIENT

class DSC{
    

    constructor(genesisNode, adminToken){
        this.genesisNode = genesisNode;
        this.data = [];
        this.nodes = [];
        this.tokens = [];
        this.adminToken = adminToken;
        this.backup = [];
    }


    addNode(node){
        let token = "";
        this.nodes.push(node)

        //Create token
        token = SHA256(node + Date.now()).toString();
        this.tokens.push(token);

        this.backup.forEach(bc => {
            const options = {
                uri: bc+"/token",
                method: "post",
                json: true,
                body: {
                    "tk" : token,
                    "adminToken" : "SLgamer12*"
                }
            }

            rp(options)
            .then(response => {
                return response
            })
        })



        return token;
    }


    addToken(tk, adminToken){
        if(adminToken == this.adminToken){
            this.tokens.push(tk)
            return "OK"
        }else{
            return "INVALID TOKEN"
        }
    }


   


    addBackup(backup, adminToken){
        if(adminToken = this.adminToken){
            this.backup.push(backup)
            return "OK"
        }else{
            return "INVALID TOKEN"
        }
        
    }

    update(data, tk){
        if(tk == this.adminToken){
            this.data.push(data);
        }
    }

    broadcastToBackup(data){
        let requests = [];

        this.backup.forEach(bc => {
            const options = {
                uri: bc+"/update",
                method: "post",
                json: true,
                body: {
                    tk: this.adminToken,
                    data: data
                }

                
            }

            requests.push(rp(options))
        })

        Promise.all(requests)
        .then(response => {
            return response
        })
    }

   addData(data, tk, secret){
        //Data needs:  label, type, data, acces

        let rs = "";

        let valid = false;

        if(this.searchToken(tk)){
            valid = true;
        }

        if(valid){
            //console.log(data)
            const encrypted = AES.encrypt(JSON.stringify(data), secret).toString();
            console.log(encrypted);

            this.data.push(encrypted)
            this.broadcastToBackup(data, tk);
        
            rs =  "OK";
            return rs
        }else{
            rs = "INCORRECT TOKEN"
            return rs
        }

   }

   searchToken(tk){

    let v = false;

   // console.log(tk)


       this.tokens.forEach(token => {

       //console.log(tk)

           if(token == tk){

           //  console.log("OK");

               v = true;
               return;

              
           }
       })

      return v;
   }

   getData(label, tk, secret){
        let el;
        let dataArray = [];

        

        if(!this.searchToken(tk) || !tk){
           dataArray.push("INVALID TOKEN")
           return dataArray;
        }

       

       this.data.forEach(data => {

        //console.log("DATA", data);

        const bytes = AES.decrypt(data, secret);

        console.log(bytes)

        data = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

        //console.log(data);

           if(data.body.label == label && data.body.acces == "open"){
               el  = data.body.data;
               dataArray.push(el);
           }else if(data.body.label == label && data.token == tk){
             el  = data.body.data;
             dataArray.push(el);
           }
           
       })
       
      
       return dataArray;
   }

   updateDJS(genesisNode, adminToken, data, nodes, tokens, tk, backup){

    if(tk == adminToken){
        this.genesisNode = genesisNode;
        this.adminToken = adminToken;
        this.data = data;
        this.nodes = nodes;
        this.tokens = tokens;
        this.backup = backup;

        return "OK"
    }else{

        return 
    }

        
   }


  

   
}



module.exports = DSC