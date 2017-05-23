angular.module('unifiguest', [])

  .controller('HomeController', ['$scope', '$http', function($scope, $http) {

    $scope.sending = false;

    $scope.checkVoucher = function() {
      $scope.sending = true;

      console.log($scope.voucher_code);

      $http.post('http://localhost:3000', { 'voucher_code': $scope.voucher_code })
        .then(function(success) {
          console.log(success);
          $scope.result = success;
          $scope.sending = false;
        },
        function(error) {
          console.log(error);
          $scope.sending = false;
          $scope.result = [];
          $scope.error = error;
        })
    }
  }])