var expect = require('expect.js'),
  cheerio = require('../..'),
  forms = require('../fixtures').forms;

describe('$(...)', function() {

  var $;

  beforeEach(function() {
    $ = cheerio.load(forms);
  });

  describe('.serializeArray', function() {

    it('() : should get form controls', function() {
      expect($('form#simple').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get nested form controls', function() {
      expect($('form#nested').serializeArray()).to.have.length(2);
      var data = $('form#nested').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'vegetable',
          value: 'Carrot'
        }
      ]);
    });

    it('() : should not get disabled form controls', function() {
      expect($('form#disabled').serializeArray()).to.eql([]);
    });

    it('() : should not get form controls with the wrong type', function() {
      expect($('form#submit').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get selected options', function() {
      expect($('form#select').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Orange'
        }
      ]);
    });

    it('() : should not get unnamed form controls', function() {
      expect($('form#unnamed').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get multiple selected options', function() {
      expect($('form#multiple').serializeArray()).to.have.length(2);
      var data = $('form#multiple').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'fruit',
          value: 'Orange'
        }
      ]);
    });

    it('() : should get individually selected elements', function() {
      var data = $('form#nested input').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'vegetable',
          value: 'Carrot'
        }
      ]);

    });

    it('() : should standardize line breaks', function() {
      expect($('form#textarea').serializeArray()).to.eql([
        {
          name: 'fruits',
          value: 'Apple\r\nOrange'
        }
      ]);
    });

  });

  describe.only('.serialize', function() {

    it('() : should get form controls', function() {
      expect($('form#simple').serialize()).to.equal('fruit=Apple');
    });

    it('() : should get nested form controls', function() {
      expect($('form#nested').serialize()).to.equal('fruit=Apple&vegetable=Carrot');
    });

    it('() : should not get disabled form controls', function() {
      expect($('form#disabled').serialize()).to.equal('');
    });

    it('() : should get multiple selected options', function() {
      expect($('form#multiple').serialize()).to.equal('fruit=Apple&fruit=Orange');
    });

    it('() : should save elements with no value as an empty string', function() {
      expect($('form#valueless').serialize()).to.equal('fruit=');
    });

    it.skip('() : should save elements with a falsy but not undefined/null value as its string equivalent', function() {
      // Convert to proper falsy value, assert it hasn't been coerced to a string, and serialize
      $('form#falsy-value input').val(0);
      expect($('form#falsy-value input').val()).to.equal(0);
      expect($('form#falsy-value').serialize()).to.equal('fruit=0');
    });

    it('() : should encode spaces as +\'s', function() {
      expect($('form#spaces').serialize()).to.equal('fruit=Blood+orange');
    });

  });

});
