(function(global) {
  var template = document.querySelector('#footer-template').innerHTML;
  Mustache.parse(template);

  global.Footer = hyperd.Component.extend({
    constructor: function() {
      hyperd.Component.apply(this, arguments);

      this.on('click', '.clear-completed', this.onClickClearCompleted);
    },

    render: function() {
      var view = {
        activeTodoCount: this.props.activeTodoCount,
        completedTodoCount: this.props.completedTodoCount,
        activeTodoWord: pluralize(this.props.activeTodoCount, 'item'),
        filterActive: this.props.filter === 'active',
        filterCompleted: this.props.filter === 'completed'
      };
      view.filterAll = !view.filterActive && !view.filterCompleted;
      return Mustache.render(template, view);
    },

    onClickClearCompleted: function(e) {
      this.emit('clear');
    }
  });

  function pluralize(count, word) {
    return count === 1 ? word : word + 's';
  }
})(window);
