// @flow strict
/*:: import type { User, AccessGrant, Admin } from '@astral-atlas/sesame-models'; */
/*:: import type { Node } from 'preact'; */

import { useAsync } from "../hooks/async";
import { useUserSesameClient } from "../hooks/sesameClient";
import { h } from 'preact';

/*::
export type Props = {|
  user: User,
  grant: ?AccessGrant,
  admin: ?Admin,
|};
*/

const AccessInfo = ()/*: Node*/ => {
  const userClient = useUserSesameClient();
  const [access] = useAsync(async () => userClient.getAccessForSelf(), [userClient]);
  return null;
};

export const SelfInfo = ()/*: Node*/ => {
  const style = {
    border: '1px solid black',
    borderRadius: '16px',
    padding: '1em',
    margin: '1em',
  }
  const userClient = useUserSesameClient();
  const [me] = useAsync(async () => userClient.getSelfUser(), [userClient]);

  if (!me)
    return null;

  return h('section', { style }, [
    h('h3', {}, me.self.name),
    h('p', {}, me.self.id),
    me.admin && h('p', {}, `Admin ${me.admin.id}`),
    me.access && me.access.grant && h('p', {}, `Logged as ${me.access.grant.deviceName} (${me.access.grant.hostName || ''})`),
  ]);
};