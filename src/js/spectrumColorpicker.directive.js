(function(undefined) {
  'use strict';
  angularSpectrumColorpicker.directive('spectrumColorpicker', function() {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        fallbackValue: '=',
        format: '=?',
        options: '=?',
        triggerId: '@?',

        onChange: '&?',
        onShow: '&?',
        onHide: '&?',
        onMove: '&?',

        onBeforeShow: '&?',
      },
      replace: true,
      templateUrl: 'directive.html',
      link: function($scope, $element, attrs, $ngModel) {

        var $input = $element.find('input');

        function formatColor(tiny) {
          var formatted = tiny;
          if (formatted) {
            formatted = tiny.toString($scope.format);
          }
          return formatted;
        }

        function callOnChange(color) {
          if (angular.isFunction($scope.onChange)) {
            $scope.onChange({color: color});
          }
        }

        function setViewValue(color) {
          var value = $scope.fallbackValue;

          if (color) {
            value = formatColor(color);
          } else if (angular.isUndefined($scope.fallbackValue)) {
            value = color;
          }

          $ngModel.$setViewValue(value);
          callOnChange(value);
        }

        var onChange = function(color) {
          $scope.$apply(function() {
            setViewValue(color);
          });
        };
        var onToggle = function() {
          $input.spectrum('toggle');
          return false;
        };


        var baseOpts = {
          color: $ngModel.$viewValue
        };

        var localOpts = {};

        angular.forEach({
          'change': 'onChange',
          'move': 'onMove',
          'hide': 'onHide',
          'show': 'onShow'
        }, function(eventKey, spectrumOptionName) {
          localOpts[spectrumOptionName] = function(color) {
            onChange(color);
            // we don't do this for change, because we expose the current
            // value actively through the model
            if (eventKey !== 'change' && angular.isFunction($scope[eventKey])) {
              return $scope[eventKey]({color: formatColor(color)});
            }
          };
        });

        if (angular.isFunction($scope.onBeforeShow)) {
          localOpts.beforeShow = function(color) {
            return $scope.onBeforeShow({color: formatColor(color)});
          };
        }

        var options = angular.extend({}, baseOpts, $scope.options, localOpts);

        function getTriggerElement() {
          return angular.element(document.body).find('#' + $scope.triggerId);
        }

        if ($scope.triggerId) {
          getTriggerElement().on('click', onToggle);
        }

        $ngModel.$render = function() {
          $input.spectrum('set', $ngModel.$viewValue || '');
          callOnChange($ngModel.$viewValue);
        };

        if (options.color) {
          $input.spectrum('set', options.color || '');
          setViewValue(options.color);
        }

        $input.spectrum(options);

        $scope.$on('$destroy', function() {
          if ($scope.triggerId) {
            getTriggerElement().off('click', onToggle);
          }
          $input.spectrum('destroy');
        });
        
        var isDisabled = angular.isDefined(options.disabled) ? options.disabled : false;
        var readDisabledFromAttribute = function () {
            return !!attrs.disabled;
        };
        $scope.$watch(readDisabledFromAttribute, function (disabledAttributePresent) {
            if (disabledAttributePresent !== isDisabled) {
                isDisabled = disabledAttributePresent;
                $input.spectrum(isDisabled ? 'disable' : 'enable');
            }
        });
      }
    };
  });
})();
