// https://github.com/jquery/jquery/blob/2.1.3/src/manipulation/var/rcheckableType.js#L2
// https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js#L12-L13
var _ = require('lodash'),
    rCRLF = /\r?\n/g,
    rcheckableType = /^(?:checkbox|radio)$/i,
    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
    // rsubmittable = /^(?:input|select|textarea|keygen)/i;

exports.serialize = function() {
  var Cheerio = this.constructor;
  return Cheerio.param(this.serializeArray());
};

exports.serializeArray = function() {
  var Cheerio = this.constructor;
  return this.find('input,select,textarea,keygen') // Taken from `rsubmittable`
    .filter(function() {
      // https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js#L91-L94
      // TODO: Come back to disabled
      var $elem = Cheerio(this);
      var type = $elem.attr('type');
      return $elem.attr('name') && !$elem.is(':disabled') &&
        // known because of `.find`
        /* rsubmittable.test(this.nodeName) && */ !rsubmitterTypes.test(type) &&
        ($elem.attr('checked') || !rcheckableType.test(type));
    }).map(function(i, elem) {
      var $elem = Cheerio(elem);
      var name = $elem.attr('name');
      var val = $elem.val();
      return val == null ?
        null :
        Array.isArray(val) ?
          _.map(val, function(val) {
            return {name: name, value: val.replace( rCRLF, '\r\n' )};
          }) :
          {name: name, value: val.replace( rCRLF, '\r\n' )};
    }).get();
};
