/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 * This class is the default event handler for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event2.handler.InlineEventHandler",
{
  extend : qx.event2.handler.AbstractEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this.base(arguments, manager);
    this.__registeredEvents = {};
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeAllListeners();
    this._disposeFields("__registeredEvents");
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // Events, which don't bubble
    __inlineEvent :
    {
      abort                       : 1,
      afterprint                  : 1,  // IE
      beforeprint                 : 1,  // IE
      beforeunload                : 1,
      blur                        : 1,
      change                      : 1,
      dragdrop                    : 1,
      DOMNodeInsertedIntoDocument : 1,  // DOM2
      DOMNodeRemovedFromDocument  : 1,  // DOM2
      error                       : 1,
      focus                       : 1,
      formchange                  : 1,  // Opera (Webforms 2)
      forminput                   : 1,  // Opera (Webforms 2)
      load                        : 1,
      losecapture                 : 1,  // IE
      mouseenter                  : 1,  // IE
      mouseleave                  : 1,  // IE
      mousewheel                  : 1,  // IE
      propertychange              : 1,  // IE
      readystatechange            : 1,
      reset                       : 1,
      scroll                      : 1,
      select                      : 1,
      selectionchange             : 1,  // IE
      selectstart                 : 1,  // IE
      stop                        : 1,  // IE
      submit                      : 1,
      unload                      : 1
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    canHandleEvent : function(element, type) {
      return this.__inlineEvent[type];
    },


    // overridden
    registerEvent : function(element, type)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var listener = qx.lang.Function.bind(this.__handleEvent, this, elementId);

      qx.event2.Manager.addNativeListener(element, type, listener);

      var id = elementId + type;

      this.__registeredEvents[id] =
      {
        element : element,
        type : type,
        listener : listener
      };
    },


    // overridden
    unregisterEvent : function(element, type)
    {
      var id = qx.core.Object.toHashCode(element) + type;

      var eventData = this.__registeredEvents[id];
      qx.event2.Manager.removeNativeListener(element, type, eventData.listener);

      delete(this.__registeredEvents[id]);
    },


    // overridden
    removeAllListeners : function()
    {
      for (var id in this.__registeredEvents)
      {
        var eventData = this.__registeredEvents[id];
        qx.event2.Manager.removeNativeListener(
          eventData.element,
          eventData.type,
          eventData.listener
        );
      }
      this.__registeredEvents = {};
    },


    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Default event handler.
     *
     * @param elementId {Integer} element id of the current target
     * @param domEvent {Event} DOM event
     */
    __handleEvent : function(elementId, domEvent)
    {
      var event = this._eventPool.getEventInstance("qx.event2.type.Event").init(domEvent);
      event.setBubbles(false);

      var eventData = this.__registeredEvents[elementId + event.getType()];
      var element = eventData ? eventData.element : event.getTarget();
      event.setCurrentTarget(element);

      this._manager.dispatchEvent(event);

      // this point can be reached after the unload handler has taken place
      // and disposed the event pool.
      if (!this.getDisposed()) {
        this._eventPool.poolEvent(event);
      }
    }

  }

});
