import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from '@uirouter/angularjs';
import todosList from '../imports/components/todosList/todosList';
import '../imports/api/tasks.js';
import '../imports/startup/accounts-config.js';

angular.module('myToDoApp', [
  angularMeteor,
  uiRouter,
  todosList.name,
  'accounts.ui'
]);


function onReady() {
  angular.bootstrap(document, ['myToDoApp']);
}
 
if (Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady);
} else {
  angular.element(document).ready(onReady);
}