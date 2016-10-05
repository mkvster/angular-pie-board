    var pieBoardController = ['$scope', function ($scope) {
        $scope.$ctrl = $scope;
        var $ctrl = $scope.$ctrl;
        $ctrl.pieBoardData = null;
        $ctrl.startAngles = [];
        $ctrl.usedAngle = 0;
        $ctrl.lastSelectedStart = -1;
        $ctrl.lastSelectedEnd = -1;
        $ctrl.internalPaddingX = 1;
        $ctrl.internalPaddingY = 1;

        $ctrl.init = function () {
            $ctrl.startAngle = parseInt($ctrl.startAngle, 10);
            $ctrl.pieBoardData = $ctrl.ngModel;
            $ctrl.arrange();
        };
        
        $ctrl.getTotalHeight = function () {
            return ($ctrl.radius + $ctrl.piePaddingY + $ctrl.internalPaddingY) * 2;
        };

        $ctrl.getTotalWidth = function () {
            return ($ctrl.radius + $ctrl.piePaddingX + $ctrl.internalPaddingX) * 2;
        };

        $ctrl.getGetAngleDir = function () {
            if ($ctrl.clockwise === null) {
                return 1;
            }
            var result = $ctrl.clockwise ? +1 : -1;
            return result;
        };

        $ctrl.addAngle = function (angle, delta) {
            return angle + $ctrl.getGetAngleDir() * delta;
        };


        $ctrl.recalculateStartAngles = function () {
            $ctrl.startAngle = parseInt($ctrl.startAngle, 10);
            $ctrl.startAngles = [];
            angular.forEach($ctrl.pieBoardData, function (pieBoardData) {
                $ctrl.startAngles.push(
                    $ctrl.addAngle($ctrl.startAngle, $ctrl.usedAngle));
                $ctrl.usedAngle += pieBoardData.angle;
            });
        };

        $ctrl.shouldShowBlankSector = function () {
            return $ctrl.usedAngle < 360;
        };

        $ctrl.getDirection = function (angle) {
            var radAngle = angle * (Math.PI / 180);
            return {
                x: Math.cos(radAngle),
                y: Math.sin(radAngle)
            };
        };

        $ctrl.arrange = function () {
            $ctrl.recalculateStartAngles();
        };

        $ctrl.getSectorPath = function (startAngle, endAngle) {
            var start = $ctrl.getDirection(startAngle);
            var end = $ctrl.getDirection(endAngle);
            var r = parseInt($ctrl.radius, 10);
            var dx = $ctrl.piePaddingX + $ctrl.internalPaddingX;
            var dy = $ctrl.piePaddingY + $ctrl.internalPaddingY;

            var longArc = ((endAngle - startAngle) <= 180) ? 0 : 1;
            var drawDir = $ctrl.clockwise ? 1 : 0;

            var d = "M" + (r + dx) + "," + ( r + dy ) +
                " L" + (r * (1 + start.x) + dx) + "," + (r * (1 + start.y)  + dy) +
                " A" + r + "," + r + ",1," + longArc + "," + drawDir + "," +
                (r * (1 + end.x) + dx) + "," + (r * (1 + end.y) + dy) +
                "Z";

            return d;
        };

        $ctrl.getPieSlicePath = function (pieSliceIndex) {
            var startAngle = $ctrl.startAngles[pieSliceIndex];
            var endAngle = $ctrl.addAngle(startAngle,
                $ctrl.pieBoardData[pieSliceIndex].angle);
            return $ctrl.getSectorPath(startAngle, endAngle);
        };

        $ctrl.getBlankSectorPath = function () {
            $ctrl.startAngle = parseInt($ctrl.startAngle, 10);
            var startAngle = $ctrl.addAngle($ctrl.startAngle, $ctrl.usedAngle);
            var endAngle = $ctrl.addAngle($ctrl.startAngle, 360);
            return $ctrl.getSectorPath(startAngle, endAngle);
        };

        $ctrl.getPieSliceTextPos = function (pieSliceIndex) {
            var startAngle = $ctrl.startAngles[pieSliceIndex];
            var midAngle = $ctrl.addAngle(startAngle,
                $ctrl.pieBoardData[pieSliceIndex].angle / 2);
            var mid = $ctrl.getDirection(midAngle);
            var r = parseInt($ctrl.radius, 10);
            return {
                x: r + (r + $ctrl.textOffset) * mid.x,
                y: r + (r + $ctrl.textOffset) * mid.y
            };
        };

        $ctrl.getPieSliceTextX = function (pieSliceIndex) {
            var pos = $ctrl.getPieSliceTextPos(pieSliceIndex);
            var result = pos.x + $ctrl.piePaddingX + $ctrl.internalPaddingX;
            return result;
        };
        
        $ctrl.getPieSliceTextY = function (pieSliceIndex) {
            var pos = $ctrl.getPieSliceTextPos(pieSliceIndex);
            var result = pos.y + $ctrl.piePaddingY + $ctrl.internalPaddingY;
            return result;
        };

        $ctrl.findSelectedIndex = function (pieSliceIndex) {
            for (var i = 0; i < $scope.selected.length; i++) {
                if ($ctrl.selected[i] === pieSliceIndex) {
                    return i;
                }
            }
            return -1;
        };

        $ctrl.isPieSliceSelected = function (pieSliceIndex) {
            if (!angular.isArray($ctrl.selected)) {
                return $ctrl.selected === pieSliceIndex;
            }
            else {
                return $ctrl.findSelectedIndex(pieSliceIndex) > -1;
            }
        };

        $ctrl.setSelectedPieSlice = function (pieSliceIndex, shouldSelect) {
            if (!angular.isArray($ctrl.selected)) {
                $ctrl.selected = pieSliceIndex;
            }
            else if (shouldSelect) {
                $ctrl.selected.push(pieSliceIndex);
            }
            else {
                var selectedIndex = $ctrl.findSelectedIndex(pieSliceIndex);
                $ctrl.selected.splice(selectedIndex, 1);
            }

        };

        $ctrl.toggleSelectedPieSlice = function (pieSliceIndex) {
            $ctrl.setSelectedPieSlice(pieSliceIndex, !$ctrl.isSelectedPieSlice(pieSliceIndex));
        };

        $ctrl.forPieSliceRange = function (isColumn, pieSliceIndex1, pieSliceIndex2, callBackFunction) {
            var startIndex = pieSliceIndex1 < pieSliceIndex2 ? pieSliceIndex1 : pieSliceIndex2;
            var endIndex = pieSliceIndex1 < pieSliceIndex2 ? pieSliceIndex2 : pieSliceIndex1;

            for (var pieSliceIndex = startIndex; pieSliceIndex <= endIndex; pieSliceIndex++) {
                callBackFunction(pieSliceIndex);
            }
        };

        $ctrl.findRange = function (isColumn, pieSliceIndex1, pieSliceIndex2) {
            var range = [];
            $ctrl.forPieSliceRange(isColumn, pieSliceIndex1, pieSliceIndex2, function (pieSliceIndex) {
                range.push(pieSliceIndex);
            });
            return range;
        };

        $ctrl.onPieSliceClick = function (pieSliceIndex, event) {
            if (!angular.isArray($ctrl.selected)) {
                $ctrl.selected = pieSliceIndex;
                $ctrl.lastSelectedStart = pieSliceIndex;
            }
            else {
                if ((!event.ctrlKey && !event.shiftKey)) {
                    $ctrl.selected = [];
                    $ctrl.lastSelectedStart = null;
                }
                if (pieSliceIndex === -1) {
                    return;
                }
                if (!event.shiftKey || $ctrl.lastSelectedStart === -1) {
                    var selectedIndex = $ctrl.findSelectedIndex(pieSliceIndex);
                    if (selectedIndex < 0) {
                        $ctrl.selected.push(pieSliceIndex);
                        $ctrl.lastSelectedStart = pieSliceIndex;
                    }
                    else if (event.ctrlKey) {
                        $ctrl.selected.splice(selectedIndex, 1);
                        $ctrl.lastSelectedStart = -1;
                    }
                } else {
                    var range = $ctrl.findRange(event.ctrlKey, $ctrl.lastSelectedStart, pieSliceIndex);
                    if (event.altKey && $scope.lastSelectedEnd !== -1) {
                        $ctrl.forPieSliceRange(event.ctrlKey,
                            $ctrl.lastSelectedStart,
                            $ctrl.lastSelectedEnd,
                            function (c) {
                                var selectedIndex = $ctrl.findSelectedIndex(c);
                                if (selectedIndex >= 0) {
                                    $ctrl.selected.splice(selectedIndex, 1);
                                }
                            });
                    }
                    for (var i = 0; i < range.length; i++) {
                        if (!$ctrl.isPieSliceSelected(range[i])) {
                            $ctrl.selected.push(range[i]);
                        }
                    }
                    $ctrl.lastSelectedEnd = pieSliceIndex;
                }
            }
        };

    }];

    var pieBoard = function ($document) {

        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                selected: '=',
                radius: '=',
                startAngle: '=',
                clockwise: '=',
                textOffset: '=',
                piePaddingX: '=',
                piePaddingY: '='
            },
            templateUrl: "templates/pie-board.tpl.html",
            replace: true,
            require: 'ngModel',
            controller: pieBoardController,
            link: function ($scope, element, attrs) {
                $scope.init();
            },
        };

    };

    pieBoard.$inject = ['$document'];
    var module = angular.module("pie.board");
    module.directive("pieBoard", pieBoard);
