// indexController.js
(function () {
    "use strict";

    var indexController = function () {

        this.pageTitle = "Pie Test";

        this.pieBoardData = [
            {
                id: 1,
                angle: 10,
                color: "lightGreen"
            },
            {
                id: 2,
                angle: 20,
                color: "yellow",
            },
            {
                id: 3,
                angle: 10,
                color: "lightGreen"
            },
            {
                id: 4,
                angle: 10,
                color: "red",
            },
            {
                id: 5,
                angle: 10,
                color: "lightGreen"
            },
            {
                id: 6,
                angle: 10,
                color: "lightGreen"
            },
            {
                id: 7,
                angle: 20,
                color: "yellow"
            },
            {
                id: 8,
                angle: 10,
                color: "lightGreen"
            },
            {
                id: 9,
                angle: 10,
                color: "gray"
            },
            {
                id: 10,
                angle: 90,
                color: "lightGreen"
            },
            {
                id: 11,
                angle: 60,
                color: "yellow"
            },
            {
                id: 12,
                angle: 30,
                color: "lightGreen"
            },
            {
                id: 13,
                angle: 10,
                color: "gray"
            },
            {
                id: 14,
                angle: 20,
                color: "yellow"
            },
            {
                id: 15,
                angle: 10,
                color: "lightGreen"
            }

        ];

        this.selected = [];
    }

    indexController.$inject = [];
    var module = angular.module("demoApp");
    module.controller("indexController", indexController);
})();
