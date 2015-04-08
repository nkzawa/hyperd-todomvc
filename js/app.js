(function(global) {
  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  var template = document.querySelector('#template').innerHTML;
  Mustache.parse(template);

  var App = hyperd.Component.extend({
    constructor: function() {
      hyperd.Component.apply(this, arguments);

      this.data.todos = store('todos');
      this.data.filter = null;

      this.on('keyup', '.new-todo', this.onKeyupNewTodo);
      this.on('change', '.toggle-all', this.onChangeToggleAll);
      this.on('click', '.clear-completed', this.onClickClearCompleted);
      this.on('change', '.todo-list .toggle', this.onChangeTodoToggle);
      this.on('dblclick', '.todo-list label', this.onDblclickTodoLabel);
      this.on('keyup', '.todo-list .edit', this.onKeyupTodoEdit);
      this.on('blur', '.todo-list .edit', this.onBlurTodoEdit);
      this.on('click', '.todo-list .destroy', this.onClickTodoDestroy);
    },

    render: function() {
      var filter = this.getFilter();
      var data = this.data;
      data.todos.forEach(function(todo) {
        todo.hidden = !filter(todo);
      });

      var view = {};
      view.todos = data.todos;
      view.activeTodoCount = this.getActiveTodos().length;
      view.completedTodoCount = data.todos.length - view.activeTodoCount;
      view.activeTodoWord = pluralize(view.activeTodoCount, 'item');
      view.filterActive = data.filter === 'active';
      view.filterCompleted = data.filter === 'completed';
      view.filterAll = !view.filterActive && !view.filterCompleted;

      return Mustache.render(template, view);
    },

    onRender: function() {
      var focused = this.data.todos.some(function(todo, i) {
        if (todo.editing) {
          this.node.querySelectorAll('.todo-list > li')[i].querySelector('.edit').focus();
          return true;
        }
      }, this);
      if (focused) return;

      this.node.querySelector('.new-todo').focus();
      store('todos', this.data.todos);
    },

    getFilter: function(filter) {
      filter = filter || this.data.filter;

      switch (filter) {
      case 'active':
        return function(todo) { return !todo.completed; };
      case 'completed':
        return function(todo) { return todo.completed; };
      default:
        return function(todo) { return true; };
      }
    },

    getFilteredTodos: function() {
      return this.data.todos.filter(this.getFilter());
    },

    getActiveTodos: function() {
      return this.data.todos.filter(this.getFilter('active'));
    },

    indexFromElement: function (el) {
      var target = el.parentNode;
      while (target && 'LI' !== target.tagName) {
        target = target.parentNode;
      }
      if (!target || !target.parentNode) return -1;

      var children = target.parentNode.children;
      for (var i = 0, len = children.length; i < len; i++) {
        if (target === children[i]) return i;
      }
      return -1;
    },

    onKeyupNewTodo: function(e) {
      if (e.which !== ENTER_KEY) return;

      var title = e.target.value.trim();
      if (!title) return;

      e.target.value = '';
      this.data.todos.push({
        title: title,
        completed: false,
        editing: false,
        hidden: false
      });
    },

    onChangeToggleAll: function(e) {
      var checked = e.target.checked;
      this.data.todos.forEach(function(todo) {
        todo.completed = checked;
      });
    },

    onClickClearCompleted: function(e) {
      this.data.todos = this.getActiveTodos();
      this.data.filter = 'all';
    },

    onChangeTodoToggle: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos[i].completed = !this.data.todos[i].completed;
    },

    onDblclickTodoLabel: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos[i].editing = true;
    },

    onKeyupTodoEdit: function(e) {
      switch(e.which) {
      case ENTER_KEY:
        e.target.blur();
        break;
      case ESCAPE_KEY:
        var i = this.indexFromElement(e.target);
        this.data.todos[i].editing = false;
        e.target.blur();
      }
    },

    onBlurTodoEdit: function(e) {
      var i = this.indexFromElement(e.target);
      var todo = this.data.todos[i];
      if (!todo.editing) return false;

      var title = e.target.value.trim();
      if (title) {
        todo.title = title;
        todo.editing = false;
      } else {
        this.data.todos.splice(i, 1);
      }
    },

    onClickTodoDestroy: function(e) {
      this.data.todos.splice(this.indexFromElement(e.target), 1);
    }
  });

  var app = global.app = new App().attachTo(document.getElementsByClassName('todoapp')[0]);

  var router = new Router();
  router.on('/:filter', function(filter) {
    app.data.filter = filter;
  });
  router.init();

  function pluralize(count, word) {
    return count === 1 ? word : word + 's';
  }

  function store(key, data) {
    if ('undefined' !== typeof data) {
      return localStorage.setItem(key, JSON.stringify(data));
    }
    data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
})(window);
