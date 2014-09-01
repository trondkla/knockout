var ko = require("knockout");

// Here's my data model
var ViewModel = function() {
    this.allItems = ko.observableArray(["Test1", "Test2", "Test3"]);
    this.selectedItems = ko.observableArray();
    this.newItem = ko.observable("");

    this.addItem = function() {
    	this.allItems.push(this.newItem().toString());
    	this.newItem("");
    };

    this.removeItem = function() {
    	this.allItems.removeAll(this.selectedItems());
    	this.selectedItems([]);
    };
};
 
ko.applyBindings(new ViewModel()); // This makes Knockout get to work