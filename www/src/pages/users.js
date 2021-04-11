// @flow strict
/*:: import type { Node } from 'preact'; */

import { accessOfferProofEncoder } from "@astral-atlas/sesame-models";
import { h } from "preact";
import { useContext, useState } from "preact/hooks";
import { sesameClientContext } from "../context/sesameClient";
import { useAsync } from "../hooks/async";
import { useAdminSesameClient } from "../hooks/sesameClient";

export const manageUsersPath = '/manage/users';
export const ManageUsersPage = ()/*: Node*/ => {
  const [offerProof, setOfferProof] = useState(null);
  const [username, setUsername] = useState('');
  const [refreshTime, setRefreshTime] = useState(Date.now())
  const { admin } = useContext(sesameClientContext);
  const [u] = useAsync(async () => admin && admin.listUsers(), [admin, refreshTime]);
  if (!u)
    return null;
  if (!admin)
    return null;
  const { users } = u;

  const onCreateUserClick = async () => {
    const { newUser } = await admin.createNewUser(username);
    setRefreshTime(Date.now());
  };

  return [
    offerProof && h('pre', {}, offerProof),
    users.map(user => h('section', {}, [
      h('pre', {}, JSON.stringify(user, null, 2)),
      h('button', { onClick: async () => {
        const { offerProof } = await admin.createAccessOffer(user.id);
        const encodedOfferProof = accessOfferProofEncoder.encode(offerProof);
        setOfferProof(encodedOfferProof);
      }}, 'Create Access'),
    ])),
    h('input', { type: 'text', onChange: e => setUsername(e.currentTarget.value), value: username }),
    h('button', { onClick: onCreateUserClick }, 'Create User'),
  ];
};