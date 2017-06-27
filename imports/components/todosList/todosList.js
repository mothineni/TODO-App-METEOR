import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from '@uirouter/angularjs';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../../api/tasks.js';

import template from './todosList.html';

class TodosListCtrl {
  constructor($scope) {
    $scope.viewModel(this);

    this.subscribe('tasks');

    this.hideCompleted = false;
    this.minlength =6;
    this.helpers({
      tasks() {
        const selector = {};

        // If hide completed is checked, filter tasks
        if (this.getReactively('hideCompleted')) {
          selector.checked = {
            $ne: true
          };
        }

        // Show newest tasks at the top
        return Tasks.find(selector, {
          sort: {
            createdAt: -1
          }
        });
      },
      incompleteCount() {
        return Tasks.find({
          checked: {
            $ne: true
          }
        }).count();
      },
      currentUser() {
        return Meteor.user();
      }
    })
  }

  addTask(newTask, completBy, priority) {
    // Insert a task into the collection
    Meteor.call('tasks.insert', {newTask,completBy, priority});

    // Clear form
    this.newTask = '';
  }

  setChecked(task) {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', task._id, !task.checked);
  }

  removeTask(task) {
    Meteor.call('tasks.remove', task._id);
  }

  setPrivate(task) {
    Meteor.call('tasks.setPrivate', task._id, !task.private);
  }
}

export default angular.module('todosList', [
  angularMeteor
])
  .component('todosList', {
    templateUrl: 'imports/components/todosList/todosList.html',
    controller: ['$scope', TodosListCtrl]
  })
  .config(config);

  function config($stateProvider, $locationProvider, $urlRouterProvider){
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/tasks');
    $stateProvider.state('tasks', {
      url: '/tasks',
      //templateUrl: 'imports/components/tasks/tasks.html'
      template:`<ul>
                  <li ng-repeat="task in $ctrl.tasks" ng-class="{'checked': task.checked, 'private': task.private}">
                    <button class="delete" ng-click="$ctrl.removeTask(task)">&times;</button>
                
                    <input type="checkbox" ng-checked="task.checked" ng-click="$ctrl.setChecked(task)" class="toggle-checked"/>
                
                    <span class="text">
                      <strong>{{task.username}}</strong> - {{task.text}}
                    </span>
                    <button class="toggle-private" ng-click="$ctrl.setPrivate(task)" ng-show="task.owner === $ctrl.currentUser._id">
                      {{task.private == true ? "Private" : "Public"}}
                    </button>
                  </li>
                </ul>`
    })
    .state('newTask', {
      url: '/newTask',
      //templateUrl: 'imports/components/newTask/newTask.html'
      template: `<form class="new-task table" name="newtaskFrm" ng-submit="$ctrl.addTask($ctrl.newTask)" ng-show="$ctrl.currentUser">
    <div  class="row">
        <input class="form-control"   ng-model="$ctrl.taskText" required ng-minlength="minlength" type="text" name="taskText" placeholder="Type to add new tasks"/>
        <span ng-show="newtaskFrm.taskText.$touched && newtaskFrm.taskText.$invalid">*Minimum 6 characters required</label>
    <input ng-model="$ctrl.priority" type="range" name="priority" min="1" max="5" value="2" step="1"/>
    <input ng-model="$ctrl.completeBy" type="date" />
    
    <div>
        <a href="/tasks" class="btn btn-raised btn-warning">Cancel</a>
        <a ng-click="create()" class="btn btn-raised btn-success">Create</a>
    </div>
    
  </form>`
    })
  }