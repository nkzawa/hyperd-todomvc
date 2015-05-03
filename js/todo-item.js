(function(global) {
  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  var template = document.querySelector('#todoitem-template').innerHTML;
  Mustache.parse(template);

  global.TodoItem = hyperd.Component.extend({
    constructor: function() {
      hyperd.Component.apply(this, arguments);

      this.on('change', '.toggle', this.onChangeToggle);
      this.on('dblclick', 'label', this.onDblclickLabel);
      this.on('keyup', '.edit', this.onKeyupEdit);
      this.on('blur', '.edit', this.onBlurEdit);
      this.on('click', '.destroy', this.onClickDestroy);
    },

    render: function() {
      return Mustache.render(template, this.props);
    },

    onRender: function() {
      if (this.props.editing) {
        this.node.querySelector('.edit').focus();
      }
    },

    onChangeToggle: function(e) {
      this.emit('toggle');
    },

    onDblclickLabel: function(e) {
      this.emit('edit');
    },

    onKeyupEdit: function(e) {
      switch(e.which) {
      case ENTER_KEY:
        e.target.blur();
        break;
      case ESCAPE_KEY:
        this.emit('cancel');
        e.target.blur();
      }
    },

    onBlurEdit: function(e) {
      this.emit('editComplete', e.target.value);
    },

    onClickDestroy: function(e) {
      this.emit('remove');
    }
  });
})(window);
