// @flow strict
/*:: import type { Node } from 'preact'; */

import { accessOfferProofEncoder } from "@astral-atlas/sesame-models";
import { h } from "preact";
import { useContext, useState } from "preact/hooks";
import { sesameClientContext } from "../context/sesameClient";
import { useAsync } from "../hooks/async";

export const manageUsersPath = '/users';
export const ManageUsersPage = ()/*: Node*/ => {
  const [offerProof, setOfferProof] = useState(null);
  const [username, setUsername] = useState('');
  const [refreshTime, setRefreshTime] = useState(Date.now())
  const { admin: adminClient } = useContext(sesameClientContext);
  const [u] = useAsync(async () => adminClient && adminClient.listUsers(), [adminClient, refreshTime]);
  if (!u)
    return null;
  if (!adminClient)
    return null;
  const { users } = u;

  const onCreateUserClick = async () => {
    const { newUser } = await adminClient.createNewUser(username);
    setRefreshTime(Date.now());
  };

  const onCreateAccessClick = (user) => async () => {
    const { admin: newAdmin } = await adminClient.createNewAdmin(user.id);
    console.log(newAdmin);
    setRefreshTime(Date.now());
  };

  return [
    offerProof && h('pre', {}, offerProof),
    h('table', {}, [
      h('caption', {}, 'Users'),
      h('thead', {}, [
        h('tr', {}, [
          h('th', {}, 'Name'),
          h('th', {}, 'ID'),
          h('th', {}, 'Admin ID'),
          h('th', {}, 'Actions')
        ])
      ]),
      h('tbody', {}, [
        users.map(u => [
          h('tr', {}, [
            h('td', {}, u.name),
            h('td', {}, u.id),
            h('td', {}, u.adminId),
            h('td', {}, [
              h('button', {}, 'Create Access'),
              h('button', {}, 'Delete'),
              h('button', { onClick: onCreateAccessClick(u) }, 'Add Admin'),
            ])
          ]),
        ])
      ]),
    ]),
    users.map(user => h('section', {}, [
      h('pre', {}, JSON.stringify(user, null, 2)),
      h('button', { onClick: async () => {
        const { offerProof } = await adminClient.createAccessOffer(user.id);
        const encodedOfferProof = accessOfferProofEncoder.encode(offerProof);
        setOfferProof(encodedOfferProof);
      }}, 'Create Access'),
    ])),
    h('input', { type: 'text', onChange: e => setUsername(e.currentTarget.value), value: username }),
    h('button', { onClick: onCreateUserClick }, 'Create User'),
  ];
};