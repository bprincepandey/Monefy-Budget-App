/**********************************************************************************
 * We have 3 modules implemented using module pattern
 *  Controller module : Controller          : EventListening
 *  data module       : BudgetController    : Internal calculations
 *  UI module         : UIController        : UI display functions
 ********************************************************************************/
/*********************** BUDGET CONTROLLER CODE*********************************/
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //budget calculation
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totalBudget[type] = sum;
  };

  //using array to store all the instances of user
  //datastructure to hold all items and the total current budget value. data object
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totalBudget: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val) {
      var newItem, id;
      //Id will be index for new Item, find the next id and use it to save new item
      //note id may be random as we may delete some item in between
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0; //initially when no item in array the id should be 0
      }

      //create new item based on inc or exp
      if (type === "exp") {
        newItem = new Expense(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }

      //push it into our datastructure
      data.allItems[type].push(newItem); //item added at end of array
      return newItem; //this return used to display in ui
    },

    testing: function() {
      console.log(data);
    },

    calculateBudget: function() {
      //calculate the total income and expense
      calculateTotal("exp");
      calculateTotal("inc");

      //calulate the total overall budget: income - expense
      data.budget = data.totalBudget.inc - data.totalBudget.exp;

      //calculate the percentage of income we spent
      if (data.totalBudget.inc > 0) {
        data.percentage = Math.round(
          (data.totalBudget.exp / data.totalBudget.inc) * 100
        );
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totalBudget.inc,
        totalExp: data.totalBudget.exp,
        percentage: data.percentage
      };
    }
  };
})();

/*********************** UI CONTROLLER CODE*********************************/
var UIController = (function() {
  //IIFE

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputbtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage"
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    getDOMStrings: function() {
      return DOMStrings;
    },
    addListItem: function(inpObj, type) {
      var html, newHtml, element;
      //Create html placeholder
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //replace the placeholders with income and expense
      newHtml = html.replace("%id%", inpObj.id);
      newHtml = newHtml.replace("%description%", inpObj.description);
      newHtml = newHtml.replace("%value%", inpObj.value);

      //Insert html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function() {
      document.querySelector(DOMStrings.inputDescription).value = "";
      document.querySelector(DOMStrings.inputValue).value = "";
      //putting cursor back to original position using : focus()
      document.querySelector(DOMStrings.inputDescription).focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expenseLabel).textContent =
        obj.totalExp;
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "--";
      }
    }
  };
})();

/*********************** APP CONTROLLER CODE*********************************/
var Controller = (function(budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDOMStrings();

  var setupEventListner = function() {
    document.querySelector(DOM.inputbtn).addEventListener("click", ctrlAddItem);

    //using keyboard event for adding the item
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function() {
    //4.Calculate the budget after item is added
    budgetCtrl.calculateBudget();
    //5. Return the budget
    var budgetObj = budgetCtrl.getBudget();
    //6. Displaying current budget after adding item
    UICtrl.displayBudget(budgetObj);
  };

  //on click of tick mark button
  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get the field input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item in budget Controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Displaying the item in the UI and clear fields
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      //4. Call updateBudget
      updateBudget();
    } else {
      alert("You have either missed description or the cost of the entry ....");
    }
  };
  return {
    init: function() {
      console.log("Application Started.....");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListner();
    }
  };
})(budgetController, UIController);

//Application starts running when we initialise eventListeners
Controller.init();
