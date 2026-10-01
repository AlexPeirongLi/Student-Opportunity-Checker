const concatenateValues = (a:string, b:string):string=>{
    return a+b
};

interface UserInterface{
    id:number;
    name:string;
    age?:Number;
    greet(message:string):void;
};

const User:UserInterface = {
    id:2,
    name:"Pedro",
    age:20,
    greet(message){
        console.log(message);
    }
};
if (!User.age){
    console.log("No age of user")
} else{
    console.log(User.age)
};

type IDFieldType = string | number; //type can be string or a number

const printID = (id: IDFieldType) => {
    console.log("ID: " + id);
};

printID(2784737894727);



interface BusinessPartner {
    name: string;
    creditScore: number;
}

interface UserIdentity {
    id: number;
    email: string;
}

type Employee = BusinessPartner & UserIdentity; //as long as object has all 4 types even multiple times it is valid

const signContract = (employee: Employee) => {
    console.log("Contract signed by " +employee.name +" with email: " +employee.email);
};

signContract({
    name: "Pedro",
    creditScore: 800,
    id: 34,
    email: "pedro@gmail.com"
});
enum LoginError {
    Unauthorized = "unauthorized",
    NoUser = "nouser",
    WrongCredentials = "wrongcredentials",
    Internal = "internal",
}

const printErrorMsg = (error: LoginError) => {
    if (error === LoginError.Unauthorized) {
        console.log("User not authorized");
    } else if (error === LoginError.NoUser) {
        console.log("No user was found with that username.");
    } else if (error === LoginError.WrongCredentials) {
        console.log("Wrong username/password combination");
    } else {
        console.log("Internal Error.");
    }

    console.log(error);
};