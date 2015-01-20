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
      expect($('form#simple').serializeArray()).to.have.length(1);
    });

    it('() : should get nested form controls', function() {
      expect($('form#nested').serializeArray()).to.have.length(2);
    });

    it('() : should not get disabled form controls', function() {
      expect($('form#disabled').serializeArray()).to.have.length(0);
    });

    it('() : should not get form controls with the wrong type', function() {
      expect($('form#submit').serializeArray()).to.have.length(1);
      expect($('form#submit').serializeArray()[0].name).to.equal('fruit');
      expect($('form#submit').serializeArray()[0].value).to.equal('Apple');
    });

    it('() : should get selected options', function() {
      expect($('form#select').serializeArray()).to.have.length(1);
      expect($('form#select').serializeArray()[0].name).to.equal('fruit');
      expect($('form#select').serializeArray()[0].value).to.equal('Orange');
    });

    it('() : should not get unnamed form controls', function() {
      expect($('form#unnamed').serializeArray()).to.have.length(1);
      expect($('form#unnamed').serializeArray()[0].name).to.equal('fruit');
      expect($('form#unnamed').serializeArray()[0].value).to.equal('Apple');
    });

    it('() : should get multiple selected options', function() {
      expect($('form#multiple').serializeArray()).to.have.length(2);
      var data = $('form#multiple').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data[0].name).to.equal('fruit');
      expect(data[0].value).to.equal('Apple');
      expect(data[1].name).to.equal('fruit');
      expect(data[1].value).to.equal('Orange');
    });

  });

  describe('.serialize', function() {

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

  });

});
