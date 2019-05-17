var mysql = require("mysql");
var inquirer = require("inquirer");

var productNameArray = [];

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "Bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    afterConnection();
});

//id product name department)name price stock_quantity
function afterConnection(){
    logProducts();
}

function logProducts(){

    getDatabaseSnapshot("SELECT * FROM products",function(response) 
    {
        response.forEach(element => {
            productNameArray.push(element.product_name);
            console.log(`ID: ${element.id} Name: ${element.product_name}
            Cost: $${element.price} Stock: ${element.stock_quantity}`);
        });
        console.log(`------------------------------------------------------------------------------`);
        selectBuy();
    });
}

function getDatabaseSnapshot(query, cb){
    connection.query(query, function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        cb(res);
    });
}

function createProduct() {
    var query = connection.query(
        "INSERT INTO products SET ?",
        {
            product_name: "Classic Burrito",
            department_name: "Snacks",
            price: 7.49,
            stock_quantity: 3
        },
        function (err, res) {
            console.log(res.affectedRows + " product inserted!\n");
        }
    );
}

function updateQuantity(product, amount) {
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: amount
            },
            {
                product_name: product
            }
        ],
        function (err, res) {
            
        }
    );
}

function selectBuy(){
    inquirer.prompt([
    {
        type: "list",
        message: "Which product will you buy?",
        name: "choice",
        choices: productNameArray
    },
    {
        type: "number",
        message: "How many would you like?",
        name: "amount"
    }]).then(function (answer) 
    {

        getDatabaseSnapshot("Select stock_quantity, price from products WHERE product_name = \"" +answer.choice + "\"", function(response){
            var inStock = response[0].stock_quantity;
            var price = response[0].price;
            var tempStr = answer.choice;
            if(tempStr[tempStr.length -1] != "s" && answer.amount > 1) {
                tempStr += "s";
            }
            if (answer.amount > inStock) {
                console.log("There is not enough product for you to buy!")
            }
            else {
                var cost = price * answer.amount;
                console.log(`You bought ${answer.amount} ${tempStr} for $${cost}!`);
                updateQuantity(answer.choice, inStock - answer.amount);
            }

            inquirer.prompt([
                {
                    type: "confirm",
                    message: "Continue shopping?",
                    name: "con",
                }]).then(function(answer) {
                    if (answer.con) {
                        logProducts();
                    }
                    else {
                        console.log("Bye Bye");
                    }
                })
        })
    })
}

