/**********************************************************************************
 * We have 3 modules implemented using module pattern
 *  Controller module : Controller          : EventListening
 *  data module       : BudgetController    : Internal calculations
 *  UI module         : UIController        : UI display functions
 *
 * Remove all comments if you dont feel like keeping them !!!
 ********************************************************************************/
/*********************** BUDGET CONTROLLER CODE*********************************/
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1; //storing percentage in prototype
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      console.log(totalIncome);
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
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

    deleteItem: function(type, id) {
      var ids;
      //select which array we want then we take out the index no of the ID we want to delete
      // map returns us the array and then we delete using splice method(used map for learning purpose)
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculatePercentages: function() {
      //iterate calcPercentage for each of the element in expense array.
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totalBudget.inc);
      });
    },

    getPercentages: function() {
      //get percentage for all elem and return
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc; //new array of percentage
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
    },
    testing: function() {
      console.log(data);
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
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    /*
    + or - before number
    round to exactly 2 decimal points
    comma separating the thousands
    syntax: str.substr(start[, length])
     */
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  //reusable callback function, instead of wrting own for loop, we can use it for other places too
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i); // calling below function by passing current & index value
    }
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
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //replace the placeholders with income and expense
      newHtml = html.replace("%id%", inpObj.id);
      newHtml = newHtml.replace("%description%", inpObj.description);
      newHtml = newHtml.replace(
        "%value%",
        formatNumber(inpObj.value, inpObj.type)
      );

      //Insert html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function() {
      document.querySelector(DOMStrings.inputDescription).value = "";
      document.querySelector(DOMStrings.inputValue).value = "";
      //putting cursor back to original position using : focus()
      document.querySelector(DOMStrings.inputDescription).focus();
    },

    deleteListItem: function(selectorID) {
      //we just need the element-id for removing the element from UI
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        //fields in a list : contain all nodes where we have percentage place holder
        // for each of those places we displa its own percentage
        //current: placeholder for that specific item and index is the current index of the nodelist
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "--";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, monthArray;
      monthArray = [
        "January",
        "February",
        "March" + "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth(); // retuns month number (it is 0 based)

      document.querySelector(DOMStrings.dateLabel).textContent =
        monthArray[month] + ", " + year;
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "--";
      }
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );
      //we pass the fields(nodelist) value to read one by one using a nodelistforeach method
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputbtn).classList.toggle("red");
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
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    //event to change colour
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function() {
    //4.Calculate the budget after item is added
    budgetCtrl.calculateBudget();
    //5. Return the budget
    var budgetObj = budgetCtrl.getBudget();
    //6. Displaying current budget after adding item
    UICtrl.displayBudget(budgetObj);
  };

  var updatePercentages = function() {
    //1. calulate the percentage when we add/del new item
    budgetCtrl.calculatePercentages();
    //2. call from budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. display in UI
    UICtrl.displayPercentages(percentages);
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

      //5. update percentage
      updatePercentages();
    } else {
      alert("You have either missed description or the cost of the entry ....");
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemId, splitID, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitID = itemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. DELETE the item from datastructure
      budgetCtrl.deleteItem(type, ID);
      //2. delete the item in UI(pass the container Id)
      UICtrl.deleteListItem(itemId);
      //3. UPDATE and SHOW the current budget
      updateBudget();
      //4. update percentage
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application Started.....");
      UICtrl.displayMonth();
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
