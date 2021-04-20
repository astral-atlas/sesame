// @flow strict
/*:: import type { User, AccessGrant, Admin } from '@astral-atlas/sesame-models'; */
/*:: import type { Node } from 'preact'; */

import { useAsync } from "../hooks/async";
import { accessOfferProofEncoder } from '@astral-atlas/sesame-models';
import { useUserSesameClient } from "../hooks/sesameClient";
import { h } from 'preact';
import { useRef, useState } from "preact/hooks";

/*::
export type Props = {|
  user: User,
  grant: ?AccessGrant,
  admin: ?Admin,
|};
*/

export const AccessInfo = ()/*: Node*/ => {
  const [refreshTime, setRefreshTime] = useState(Date.now());
  const userClient = useUserSesameClient();
  const [self] = useAsync(async () => userClient.getSelfUser(), [userClient]);
  const [accessResponse] = useAsync(async () => userClient.getAccessForSelf(), [userClient, refreshTime]);
  if (!accessResponse || !self)
    return null;
  const { access: currentAccess, self: selfUser } = self;
  const { access: allAccess } = accessResponse;

  const onRevokeClick = (access) => async () => {
    await userClient.revokeAccess(selfUser.id, access.id);
    setRefreshTime(Date.now())
  };

  return [
    h('ul', {},
      allAccess
      .filter(a => !a.revocation)
      .map(a => h('li', {
        class: [
          'access-info',
          currentAccess && currentAccess.id === a.id && 'selected'
        ].join(' ')
      }, [
        h('span', {}, [
          a.grant && h('p', { class: 'access-info-device' }, a.grant.deviceName),
          h('pre', { class: 'access-info-id' }, a.id),
        ]),
        h('hr'),
        a.grant && a.grant.hostName &&
          h('span', {}, [
             h('a', { class: 'access-info-host', href: a.grant.hostName }, a.grant.hostName),
          ]),
        a.grant ? null :
          h('span', {}, [
            h('p', { class: 'access-info-host' }, 'Access Offer not Accepted yet.'),
          ]),
        h('hr'),
        h('span', { class: 'collapse' }, [
          h('button', {
            class: 'access-info-revoke', disabled: currentAccess && currentAccess.id === a.id,
            onClick: onRevokeClick(a),
          }, 'Revoke'),
        ]),
      ]))
    ),
/*
    h('table', {}, [
      h('thead', {}, h('tr', {}, [
        h('th', {}, 'Access ID'),
        h('th', {}, 'Device Name'),
        h('th', {}, 'Host Name'),
        h('th', {}, 'Revocation ID'),
        h('th', {}, 'Actions'),
      ])),
      h('tbody', {}, allAccess.map(a => [
        h('tr', {}, [
          h('td', {}, a.id),
          h('td', {}, a.grant && a.grant.deviceName),
          h('td', {}, a.grant && a.grant.hostName),
          h('td', {}, a.revocation && a.revocation.id),
          h('td', {}, [
            h('button', {}, 'Revoke'),
          ]),
        ])
      ]))
    ]),
    */
    h(SelfAccessForm, { setRefreshTime }),
  ];
};
export const SelfAccessForm = ({ setRefreshTime }/*: { setRefreshTime: number => void }*/)/*: Node*/ => {
  const userClient = useUserSesameClient();
  const [offerProof, setOfferProof] = useState(null);

  const accessCodeElement = useRef/*:: <?HTMLElement>*/(null);
  const onNewAccessCodeClick = async () => {
    const { offerProof: newOfferProof } = await userClient.createAccessOfferForSelf();
    setOfferProof(newOfferProof);
    setRefreshTime(Date.now());
  };
  const onAccessCodeClipboardClick = () => {
    if (!offerProof)
      return;
    navigator.clipboard.writeText(accessOfferProofEncoder.encode(offerProof));
    const currentAccessCodeElement = accessCodeElement.current;
    if (!currentAccessCodeElement)
      return;
    const newRange = document.createRange();
    newRange.selectNode(currentAccessCodeElement);
    const selection = window.getSelection();
    selection.addRange(newRange);
  };
  return [
    h('button', { onClick: onNewAccessCodeClick, class: 'access-code-creator' }, 'Create New Access Code'),
    offerProof &&  h('span', { class: 'access-form-code' }, [
      h('p', {}, 'Access Code (Keep it secret!)'),
      h('span', { class: 'access-form-code-row' }, [
        h('pre', { ref: accessCodeElement, class: 'access-code' }, accessOfferProofEncoder.encode(offerProof)),
        h('button', { class: 'access-code-clipboard', onClick: onAccessCodeClipboardClick }, 'Copy to Clipboard')
      ]),
    ]),
  ]
};

export const SelfInfo = ()/*: Node*/ => {
  const style = {
    border: '1px solid black',
    borderRadius: '16px',
    padding: '1em',
    margin: '1em',
    display: 'flex',
    flexDirection: 'column',
    width: '50%'
  };
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