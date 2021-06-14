const rp = require("request-promise");
const SHA256 = require("crypto-js/sha256");

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

    broadcastToBackup(data, token){
        let requests = [];

        this.backup.forEach(bc => {
            const options = {
                uri: bc+"/"+"data",
                method: "post",
                json: true,
                body: {
                    "token" : token,
                    data
                }

                
            }

            requests.push(rp(options))
        })

        Promise.all(requests)
        .then(response => {
            return response
        })
    }

   addData(data, tk){
        //Data needs:  label, type, data, acces

        let rs = "";

        let valid = false;

        if(this.searchToken(tk)){
            valid = true;
        }

        if(valid){
            this.data.push(data)
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

      //  console.log(token)

           if(token == tk.toString()){

           //  console.log("OK");

               v = true;
               return;

              
           }
       })

      return v;
   }

   getData(label, tk){
        let el;
        let dataArray = [];

        

        if(!this.searchToken(tk) || !tk){
           dataArray.push("INVALID TOKEN")
        }

       

       this.data.forEach(data => {
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