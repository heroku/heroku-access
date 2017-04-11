'use strict'
/* globals describe it beforeEach afterEach context cli nock expect */

let cmd = require('../../../commands/access')[0]
let stubGet = require('../../stub/get')

describe('heroku access', () => {
  context('with personal app', () => {
    beforeEach(() => cli.mockConsole())
    afterEach(() => nock.cleanAll())

    it('shows the app collaborators', () => {
      let apiGetPersonalApp = stubGet.personalApp()
      let apiGetAppCollaborators = stubGet.appCollaborators()

      return cmd.run({app: 'myapp', flags: {}})
        .then(() => expect(
          `jeff@heroku.com   collaborator
raulb@heroku.com  owner
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetPersonalApp.done())
        .then(() => apiGetAppCollaborators.done())
    })
  })

  context('with organization/team', () => {
    beforeEach(() => cli.mockConsole())
    afterEach(() => nock.cleanAll())

    it('shows the app collaborators and hides the team collaborator record', () => {
      let apiGetTeamApp = stubGet.teamApp()
      let apiGetTeamMembers = stubGet.teamMembers()
      let apiGetAppPermissions = stubGet.appPermissions()
      let apiGetTeamAppCollaboratorsWithPermissions = stubGet.teamAppCollaboratorsWithPermissions()

      return cmd.run({app: 'myapp', flags: {}})
        .then(() => expect(
          `bob@heroku.com    member  deploy,view
raulb@heroku.com  admin   deploy,manage,operate,view
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamApp.done())
        .then(() => apiGetTeamMembers.done())
        .then(() => apiGetAppPermissions.done())
        .then(() => apiGetTeamAppCollaboratorsWithPermissions.done())
    })
  })
})
