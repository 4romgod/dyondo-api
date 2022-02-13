const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const dbHandler = require('../dbHandler');

before(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
after(async () => await dbHandler.closeDatabase());

describe('controllerAuth', () => {
    context('when user already exists', () => {
        it('should return an error', async () => {});
    });
})