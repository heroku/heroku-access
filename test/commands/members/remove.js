'use strict'
/* globals describe it beforeEach afterEach cli nock expect context */

let cmd = require('../../../commands/members/remove')
let stubDelete = require('../../stub/delete')
let stubGet = require('../../stub/get')

describe('heroku members:remove', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  context('from an org', () => {
    beforeEach(() => {
      stubGet.teamInfo('enterprise')
    })

    it('removes a member from a team', () => {
      let apiRemoveMemberFromTeam = stubDelete.memberFromTeam()
      return cmd.run({args: {email: 'foo@foo.com'}, flags: {team: 'myteam'}})
      .then(() => expect('').to.eq(cli.stdout))
      .then(() => expect(`Removing foo@foo.com from myteam... done\n`).to.eq(cli.stderr))
        .then(() => apiRemoveMemberFromTeam.done())
    })
  })

  context('from a team', () => {
    beforeEach(() => {
      stubGet.teamInfo('team')
    })

    context('without the feature flag team-invite-acceptance', () => {
      beforeEach(() => {
        stubGet.teamFeatures([])
      })

      context('using --org instead of --team', () => {
        it('removes the member, but it shows a warning about the usage of -t instead', () => {
          let apiRemoveMemberFromTeam = stubDelete.memberFromTeam()
          return cmd.run({org: 'myteam', args: {email: 'foo@foo.com'}, flags: {}})
          .then(() => expect('').to.eq(cli.stdout))
          .then(() => expect(`Removing foo@foo.com from myteam... done
 ▸    myteam is a Heroku Team
 ▸    Heroku CLI now supports Heroku Teams.
 ▸    Use -t or --team for teams like myteam\n`).to.eq(cli.stderr))
            .then(() => apiRemoveMemberFromTeam.done())
        })
      })

      it('removes a member from a team', () => {
        let apiRemoveMemberFromTeam = stubDelete.memberFromTeam()
        return cmd.run({args: {email: 'foo@foo.com'}, flags: {team: 'myteam'}})
        .then(() => expect('').to.eq(cli.stdout))
        .then(() => expect(`Removing foo@foo.com from myteam... done\n`).to.eq(cli.stderr))
        .then(() => apiRemoveMemberFromTeam.done())
      })
    })

    context('with the feature flag team-invite-acceptance', () => {
      let apiGetTeamInvites

      beforeEach(() => {
        stubGet.teamFeatures([{name: 'team-invite-acceptance', enabled: true}])
      })

      context('with no pending invites', () => {
        beforeEach(() => {
          apiGetTeamInvites = stubGet.teamInvites([])
        })

        it('removes a member', () => {
          let apiRemoveMemberFromTeam = stubDelete.memberFromTeam()
          return cmd.run({args: {email: 'foo@foo.com'}, flags: {team: 'myteam'}})
          .then(() => expect('').to.eq(cli.stdout))
          .then(() => expect(`Removing foo@foo.com from myteam... done\n`).to.eq(cli.stderr))
          .then(() => apiGetTeamInvites.done())
          .then(() => apiRemoveMemberFromTeam.done())
        })
      })

      context('with pending invites', () => {
        beforeEach(() => {
          apiGetTeamInvites = stubGet.teamInvites([
            { user: { email: 'foo@foo.com' } }
          ])
        })

        it('revokes the invite', () => {
          let apiRevokeTeamInvite = stubDelete.teamInvite('foo@foo.com')

          return cmd.run({args: {email: 'foo@foo.com'}, flags: {team: 'myteam'}})
          .then(() => expect('').to.eq(cli.stdout))
          .then(() => expect(`Revoking invite for foo@foo.com in myteam... done\n`).to.eq(cli.stderr))
          .then(() => apiGetTeamInvites.done())
          .then(() => apiRevokeTeamInvite.done())
        })
      })
    })
  })
})
