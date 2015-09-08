(function(undefined) {
  'use strict';
  angularSpectrumColorpicker.directive('spectrumColorpicker', function() {
    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        fallbackValue: '=',
        disabled: '=?',
        format: '=?',
        options: '=?',
        triggerId: '@?',
        palette : '=?',
        initialColor: '=?',
        onChange: '&?',
        onShow: '&?',
        onHide: '&?',
        onMove: '&?',

        onBeforeShow: '&?',
		
	    onChangeOptions: '=?',
	    onShowOptions: '=?',
	    onHideOptions: '=?',
	    onMoveOptions: '=?'
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
                'show': 'onShow',
            },
            function (eventHandlerName, eventName) {
                var spectrumEventHandlerOptions = $scope[eventHandlerName + 'Options'];
                localOpts[eventName] = function (color) {
                    if (!spectrumEventHandlerOptions || spectrumEventHandlerOptions.update) {
                        onChange(color);
                    }
                    // we don't do this for change, because we expose the current
                    // value actively through the model
                    if (eventHandlerName !== 'change' && angular.isFunction($scope[eventHandlerName])) {
                        return $scope[eventHandlerName]({ color: formatColor(color) });
                    } else {
                        return null;
                    }
               };
          });

        if (angular.isFunction($scope.onBeforeShow)) {
          localOpts.beforeShow = function(color) {
            return $scope.onBeforeShow({color: formatColor(color)});
          };
        }
		
		if ($scope.palette) {
          localOpts.palette = $scope.palette;
        }

        var options = angular.extend({}, baseOpts, $scope.options, localOpts);

        if ($scope.triggerId) {
          angular.element(document.body).on('click', '#' + $scope.triggerId, onToggle);
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
            angular.element(document.body).off('click', '#' + $scope.triggerId, onToggle);
          } 
        });
		$element.on('$destroy', function(){
			$input.spectrum('destroy');
		});

        if(angular.isDefined(options.disabled)) {
          $scope.disabled = !!options.disabled;
        }

        $scope.$watch('disabled', function (newDisabled) {
          $input.spectrum(newDisabled ? 'disable' : 'enable');
        });		

		$scope.$watch('palette', function (palette) {
		  $input.spectrum('option', 'palette', palette);
		});

        $scope.$watch('initialColor', function (initialColor) {
          $input.spectrum('set', initialColor);
        });
      }
    };
  });
})();
