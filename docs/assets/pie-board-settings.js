//pie-board-settings.js
(function () {
    "use strict";

    var pieBoardSettings = function () {
        return {
            restrict: "E",
            templateUrl: "./assets/pie-board-settings.tpl.html",
            replace: true
        };
    };

    pieBoardSettings.$inject = [];
    var module = angular.module("demoApp");
    module.directive("pieBoardSettings", pieBoardSettings);

})();
