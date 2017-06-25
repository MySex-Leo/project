
var app = angular.module('dcb', ['ng', 'ngRoute']);

app.factory('$debounce', ['$rootScope', '$browser', '$q', '$exceptionHandler',
  function($rootScope, $browser, $q, $exceptionHandler) {
    var deferreds = {},
      methods = {},
      uuid = 0;

    function debounce(fn, delay, invokeApply) {
      var deferred = $q.defer(),
        promise = deferred.promise,
        skipApply = (angular.isDefined(invokeApply) && !invokeApply),
        timeoutId, cleanup,
        methodId, bouncing = false;

      angular.forEach(methods, function(value, key) {
        if (angular.equals(methods[key].fn, fn)) {
          bouncing = true;
          methodId = key;
        }
      });

      if (!bouncing) {
        methodId = uuid++;
        methods[methodId] = { fn: fn };
      } else {
        deferreds[methods[methodId].timeoutId].reject('bounced');
        $browser.defer.cancel(methods[methodId].timeoutId);
      }

      var debounced = function() {
        delete methods[methodId];

        try {
          deferred.resolve(fn());
        } catch (e) {
          deferred.reject(e);
          $exceptionHandler(e);
        }

        if (!skipApply) $rootScope.$apply();
      };

      timeoutId = $browser.defer(debounced, delay);

      methods[methodId].timeoutId = timeoutId;

      cleanup = function(reason) {
        delete deferreds[promise.$$timeoutId];
      };

      promise.$$timeoutId = timeoutId;
      deferreds[timeoutId] = deferred;
      promise.then(cleanup, cleanup);

      return promise;
    }

    debounce.cancel = function(promise) {
      if (promise && promise.$$timeoutId in deferreds) {
        deferreds[promise.$$timeoutId].reject('canceled');
        return $browser.defer.cancel(promise.$$timeoutId);
      }
      return false;
    };

    return debounce;
  }
]);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/start', {
      templateUrl: 'tpl/start.html'
    })
    .when('/main', {
      templateUrl: 'tpl/main.html',
      controller: 'MainCtrl'
    })
    .when('/detail/:id', {
      templateUrl: 'tpl/detail.html',
      controller: 'DetailCtrl'
    })
    .when('/order/:id', {
      templateUrl: 'tpl/order.html',
      controller: 'OrderCtrl'
    })
    .when('/myOrder', {
      templateUrl: 'tpl/myOrder.html',
      controller: 'MyOrderCtrl'
    })
    .otherwise({redirectTo: '/start'})
});

app.controller('parentCtrl',
  ['$scope', '$location',
    function ($scope, $location) {
      $scope.jump = function (desPath) {
        $location.path(desPath);
      }
    }
  ]);

app.controller('MainCtrl',
  ['$scope', '$http','$debounce',
  function ($scope, $http,$debounce) {
    $scope.kw = '';
    $scope.hasMore = true;
    $http
      .get('data/dish_getbypage.php')
      .success(function (data) {
        $scope.dishList = data;
      });

    $scope.loadMore = function () {
      $http
        .get('data/dish_getbypage.php?start=' +
        $scope.dishList.length)
        .success(function (data) {
          if (data.length < 5) {
            $scope.hasMore = false;
          }
          $scope.dishList = $scope.dishList.concat(data);
        })
    };

    var handler = function(){
      $http
        .get('data/dish_getbykw.php?kw=' + $scope.kw)
        .success(function (data) {
          if (data.length > 0) {
            $scope.dishList = data;
          }
        })
    };

    $scope.$watch('kw', function () {
      console.log($scope.kw);
      if ($scope.kw.length > 0) {
        $debounce(handler,300);
      }

    });
  }
]);

app.controller('DetailCtrl',
  ['$scope', '$http', '$routeParams',
    function ($scope, $http, $routeParams) {
      var did = $routeParams.id;
      $http
        .get('data/dish_getbyid.php?id=' + did)
        .success(function (data) {
          $scope.dish = data[0];
        })
    }
  ]);

app.controller('OrderCtrl',
  ['$scope', '$http', '$routeParams', '$httpParamSerializerJQLike',
    function ($scope, $http, $routeParams, $httpParamSerializerJQLike) {
      $scope.order = {did: $routeParams.id};
      $scope.submitOrder = function () {
        console.log($scope.order);
        var result = $httpParamSerializerJQLike($scope.order);
        $http
          .get('data/order_add.php?' + result)
          .success(function (data) {
            console.log(data);
            if (data[0].msg == 'succ') {
              $scope.AddResult = '下单成功，订单编号为' + data[0].oid;
              sessionStorage.setItem('phone',
                $scope.order.phone)
            }
            else {
              $scope.AddResult = "下单失败";
            }

          })
      }
    }
  ]);

app.controller('MyOrderCtrl', ['$scope', '$http',
  function ($scope, $http) {
    var phone = sessionStorage.getItem('phone');
    $http
      .get('data/order_getbyphone.php?phone=' + phone)
      .success(function (data) {
        console.log(data);
        $scope.orderList = data;
      })
  }
]);


