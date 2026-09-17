//Louis DePrez, used to authenticate users. very rough right now as not actually hooked up to a database yet
function userAuth(){
    testPerson = new User("John Doe", "a", "s");
    testPerson2 = new User("Mary Doe", "b", "p");
    console.log("User " + testPerson.gName() + " is a " + testPerson.gType());
    console.log("User " + testPerson2.gName() + " is a " + testPerson2.gType());
    //temp code until we can get databse
    var name = consoleInput("whats ur name");
    var pass = consoleInput("whats da passwahd");
    console.log (name + " " + pass);

}
//Louis DePrez, class for differentiating between user types and what they can see
class User {
    constructor(name, password, type){
        /* name is the user name and Type
        type of user in question. Current idea is that there will be only 2: Student and Professor.
        In current theory this class is only used to determine what is visually displayed on the app
        */
      this.name = name;
      this.password = password;
       this.type = type.toLowerCase(); //catch incorrect Type inputs, if possible
       if(this.type != "s" || this.type != "p"){
        this.type = "s"
       }
    }
    //prints the name to the console
    gName(){
        return(this.name);
    }
    //set new name... maybe have userName and Name be different things.
    sName(n){
        this.name = n;
    }
    //returns the type of the user
    gType() {
        return(this.type);
    }
}
function consoleInput(inputS){
    //code is taken from the nodeJS module on how to use the readLine function and is not original work.
    //used because this is meant to be temp code until database
    const readline = require('node:readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question(inputS, answer => {
        return(answer);
    });
}
userAuth();