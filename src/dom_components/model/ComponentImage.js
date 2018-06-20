var Component = require('./Component');

module.exports = Component.extend(
  {
    defaults: {
      ...Component.prototype.defaults,
      type: 'image',
      tagName: 'img',
      customBadgeLabel: 'Image',
      activeOnRender: 1,
      src: '',
      void: 1,
      droppable: 0,
      copyable: 0,
      draggable: 0,
      editable: 1,
      highlightable: 0,
      resizable: 1,
      unstylable: ['max-width', 'min-height', 'text-shadow',
      'font', 'font-size', 'font-weight', 'letter-spacing', 'vertical-align',
      'color', 'line-height', 'text-decoration', 'font-family', 'font-style'
     ],
     

      // File to load asynchronously once the model is rendered
      file: ''
    },

    initialize(o, opt) {
      Component.prototype.initialize.apply(this, arguments);
      var attr = this.get('attributes');
      if (attr.src) this.set('src', attr.src);

      this.listenTo(this, 'active', this.doOnDropStuff); // listen for active event
      this.on('destroy', this.handleRemove);

      if(!this.get('isdrop')) {
        this.set({ style: {} });
      }
      else {
        this.doOnDropStuff();
      }
    },


    /* CUSTOM CODE TO HANDLE TRAITS & ON DROP/REMOVE LOGIC */
    handleRemove: function() {
      editor.Panels.getButton('views', 'open-blocks').set('active', 1);

    },
    doOnDropStuff: function (component, value) {
      //open the image/link settings
      editor.select(this);
      editor.Panels.getButton('views', 'open-tm').set('active', 1);
      updateMediaLibaryTrait();    
      
      // we don't want the slider to be used for the width, make it an integer
      $("#gjs-sm-width").removeClass('gjs-sm-slider').addClass('gjs-sm-integer');
      $("#gjs-sm-width .gjs-field-range").remove();
      let widthProp = editor.StyleManager.getProperty("Dimension", "width");
      widthProp.set('type', 'integer');
      widthProp.set("min", 0);
      widthProp.set("max", "");
      widthProp.set("step", 1);
      widthProp.unset("showInput");
    },
    updateDimensions: function(component, src) {

     
      var m = this;
      var img = new Image();
      var srcHeight = 0;
      var srcWidth = 0;
        
    
      //set the image src in order to get the read dimensions
      img.src = src;

      //add event listener with callback to set the dimensions once the image has loaded
      if (img.complete) {
        this.imgLoaded(img.width, img.height, component);
      } else {
        img.addEventListener('load', this.imgLoaded)
      }
     
    },
    //updateDimensions image load callback
    imgLoaded: function(w, h, thisModel) {

      var srcWidth = 0;
      var srcHeight = 0;
      var classId = "";

      //check if we have info passed in or an object 
      if(typeof w === "object") {
        thisModel = editor.getSelected();
        srcWidth = w.target.width;
        srcHeight = w.target.height;
      }
      else {
        srcWidth = w;
        srcHeight = h;
      }

      //we need to get the class id that was assigned, and set our new dimensions as a class rule
      //setting it to the model inlines the css, and the image is not resizable
      var classes = thisModel.get('classes').models;
     
      for(var i=0; i<classes.length; i++) {
        //there should only be 2 classes because we control the image component customImg
       if(classes[i].id != "linkImage") {
          classId = classes[i].id;
       }
      }

        if(srcHeight != 0) {
          try {
            var sm = editor.SelectorManager;
            var sel1 = sm.add('linkImage');
            var sel2 = sm.add(classId);
            var rule = editor.CssComposer.get([sel1, sel2]);
            rule.set('style', { width: srcWidth + 'px', height: srcHeight + 'px' });
            thisModel.view.render();
          }
          catch(ex) {console.log(ex);}
          //unselect and reslect the component to adjust the resizer to the new size
          editor.select();
          editor.select(thisModel);
        }
    },
   
    updateHref: function (component, value) {

      if (this) {
        try {
          this.attributes.attributes.href = value;
          this.set('href', value);
        }
        catch (x) { }
      }
    },
    updateName: function (component, value) {
      if (this) {
        try {
          this.attributes.attributes.name = value;
          this.set('name', value);
          component.view.$el.find("a").attr('name', value);
        }
        catch (x) { }
      }
    },
    updateAlt: function (component, value) {
      component.view.$el.attr('alt', value);
      component.view.$el.find("img").attr('alt', value);
      if (this) {
        try {
          this.attributes.attributes.alt = value;
          this.set('alt', value);
        }
        catch (x) { }
      }
    },

    initToolbar(...args) {
      Component.prototype.initToolbar.apply(this, args);
      const em = this.em;

      if (em) {
        var cmd = em.get('Commands');
        var cmdName = 'image-editor';

        // Add Image Editor button only if the default command exists
        if (cmd.has(cmdName)) {
          var tb = this.get('toolbar');
          tb.push({
            attributes: { class: 'fa fa-pencil' },
            command: cmdName
          });
          this.set('toolbar', tb);
        }
      }
    },

    /**
     * Returns object of attributes for HTML
     * @return {Object}
     * @private
     */
    getAttrToHTML(...args) {
      var attr = Component.prototype.getAttrToHTML.apply(this, args);
      delete attr.onmousedown;
      var src = this.get('src');
      if (src) attr.src = src;
      return attr;
    },

    /**
     * Parse uri
     * @param  {string} uri
     * @return {object}
     * @private
     */
    parseUri(uri) {
      var el = document.createElement('a');
      el.href = uri;
      var query = {};
      var qrs = el.search.substring(1).split('&');
      for (var i = 0; i < qrs.length; i++) {
        var pair = qrs[i].split('=');
        var name = decodeURIComponent(pair[0]);
        if (name) query[name] = decodeURIComponent(pair[1]);
      }
      return {
        hostname: el.hostname,
        pathname: el.pathname,
        protocol: el.protocol,
        search: el.search,
        hash: el.hash,
        port: el.port,
        query
      };
    }
  },
  {
    /**
     * Detect if the passed element is a valid component.
     * In case the element is valid an object abstracted
     * from the element will be returned
     * @param {HTMLElement}
     * @return {Object}
     * @private
     */
    isComponent(el) {
      var result = '';
      if (el.tagName == 'IMG') {
        result = { type: 'image' };
      }
      return result;
    }
  }
);


