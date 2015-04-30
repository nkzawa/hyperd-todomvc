(function(global) {
  var ENTER_KEY = 13;

  var template = document.querySelector('#app-template').innerHTML;
  Mustache.parse(template);

  global.App = hyperd.Component.extend({
    components: {
      'todo-item': TodoItem
    },

    constructor: function() {
      hyperd.Component.apply(this, arguments);

      this.data.todos = store('todos');
      this.data.filter = null;

      this.on('keyup', '.new-todo', this.onKeyupNewTodo);
      this.on('change', '.toggle-all', this.onChangeToggleAll);
      this.on('click', '.clear-completed', this.onClickClearCompleted);
      this.on('toggle', '.todo-item', this.onToggleTodoItem);
      this.on('edit', '.todo-item', this.onEditTodoItem);
      this.on('change', '.todo-item', this.onChangeTodoItem);
      this.on('cancel', '.todo-item', this.onCancelTodoItem);
      this.on('remove', '.todo-item', this.onRemoveTodoItem);
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
      var editing = this.data.todos.some(function(todo) {
        return todo.editing;
      });
      if (!editing) {
        this.node.querySelector('.new-todo').focus();
      }
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

    indexFromElement: function (el) {
      var children = el.parentNode.children;
      for (var i = 0, len = children.length; i < len; i++) {
        if (el === children[i]) return i;
      }
      return -1;
    },

    onToggleTodoItem: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos[i].completed = !this.data.todos[i].completed;
    },

    onEditTodoItem: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos[i].editing = true;
    },

    onCancelTodoItem: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos[i].editing = false;
    },

    onChangeTodoItem: function(e, title) {
      var i = this.indexFromElement(e.target);
      var todo = this.data.todos[i];
      if (!todo.editing) return false;

      title = title.trim();
      if (title) {
        todo.title = title;
        todo.editing = false;
      } else {
        this.data.todos.splice(i, 1);
      }
    },

    onRemoveTodoItem: function(e) {
      var i = this.indexFromElement(e.target);
      this.data.todos.splice(i, 1);
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
