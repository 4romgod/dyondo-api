const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const { smartTrim } = require('../../src/helpers/blogHandler');

describe('blogHandler', () => {
    context('when string is short', () => {
        it('should return full string', () => {
            expect(smartTrim('A short string', 100, ".", "")).to.be.equal('A short string');
        });
    });

    context('when string is long', () => {
        it('should trim the string', () => {
            const str = 'This is an example, of a long string';
            expect(smartTrim(str, 30, ',', ' ...')).to.be.equal('This is an example ...');
        });
    });
});