'use strict'
/* globals describe it beforeEach afterEach cli nock expect */

let cmd = require('../../../commands/orgs/open')
let unwrap = require('../../unwrap')

describe('heroku orgs:open', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  it('shows a deprecation message', () => {
    return cmd.run({})
      .then(() => expect('').to.eq(cli.stdout))
      .then(() => expect(
        ` ▸    orgs:open is no longer in the CLI. Please use the "teams:open" command instead. See https://devcenter.heroku.com/articles/heroku-teams for more info.
`).to.eq(unwrap(cli.stderr)))
  })
})
