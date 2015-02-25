console.log("ass8");
Auvik.Badge = {
  initialize : function(el, cssClass, badgeId, dismissAllId, subscription) {
    var current = 0,
        collection = subscription.collection,
        summarySubscription = pub.subscribeToTable("AlertCount", 'com.auvik.schemas.web.UnacknowledgedAlertsSummary', {"viewLevel" : AuvikConstants.EVENT_VIEW_LEVEL_NONE});

    function setLength() {
      var models = summarySubscription.collection.models, count = 0;

      count += models.length > 0 ? models[0].get('count') : 0;

      if (current === 0 && count > 0) {
        // add
        $(el).after('<span class="badge ' + cssClass + ' pull-right">' + count + '</span>');
      } else if (current > 0 && count === 0) {
        // remove
        $(el).next().remove();
      } else {
        // change
        $(el).next().html(count);
      }
      current = count;
    }

    function bindDismissLinks() {
      //// Make sure any added nodes have the dismiss handler registered.
      $('.event-dismiss', '.notification-menu').click(function(e) {
            $.ajax(globalRoutes.controllers.WebApplication.clearEventAjax(this.value).url);
            e.preventDefault();
            return false;
      });
    }
    summarySubscription.open();
    summarySubscription.collection.on('reset add change remove', setLength);
    collection.on('reset add change remove', bindDismissLinks);

    $(badgeId).click(function() {
      var i = 0, curModel, ids = [];
      // Check if we're not open which means
      // we're opening and that's the point
      // we mark events read.
      if($(badgeId).is(":visible")) {
        _.defer(function() {
          if( collection.models.length > 0 ) {
            var model = _.max(collection.models, function(e) { return e.get('receivedDate'); });
            Auvik.eventing.util.markEventReadByTimestamp(model.get('receivedDate'), AuvikConstants.EVENT_VIEW_LEVEL_SEEN);
          }
        });
      }
    });

    $(dismissAllId).click(function() {
      var i = 0, curModel, ids = [];
      _.defer(function() {
        for(i; i < collection.models.length; i++) {
          curModel = collection.models[i];

          ids.push(curModel.id);

          // Batch at most 50 so we don't overflow the http path.
          if( ids.length >= 50 ) {
            Auvik.eventing.util.markEventDismissed(ids.join(','));
            ids = [];
          }
        }
        if( ids.length > 0 ) {
          Auvik.eventing.util.markEventDismissed(ids.join(','));
        }
      });
    });
  }
};

$(document).ready(function() {
    var subscription = Auvik.eventing.util.eventSubscribe('AlertEventMesssages', 'WebEventMessageWithoutAncestryByAlertableByUserAcknowledgedLimit50', {a0: true, a1: false}),
        widget = Auvik.SubscriptionView.initialize(".notification-menu", subscription, Auvik.util.fetchStaticTemplate('/assets/template/alert.html'), Messages('js.alert.no.active'),
            Auvik.eventing.util.sortedByDate),
        badge = Auvik.Badge.initialize(".glyphicon-bell", "badge-onboarding", "#event-bell", "#dismiss-all-alerts", subscription);

    subscription.open();
});


