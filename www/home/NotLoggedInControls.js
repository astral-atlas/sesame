// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { IdentityProof } from "@astral-atlas/sesame-models"; */

import { h, useState, useMemo } from '@lukekaalim/act';
import { decodeProofToken, createIdentityProof } from "@astral-atlas/sesame-models";
import { createClient } from "@astral-atlas/sesame-client";
import { createWebClient } from "@lukekaalim/http-client";

import styles from './home.module.css';
import { useAPI } from "../hooks/api.js";
import { useConfig } from "../hooks/config.js";
import { useAsync } from "../src/hooks/async";
import { CopperButton } from "../components/button";

/*::
export type NotLoggedInControlsProps = {
  onIdentityChange: (identity: ?{ proof: IdentityProof, version: number }) => mixed, 
};
*/

const UseTokenControls = ({ loginToken, onIdentityChange }) => {
  const loginProof = useMemo(() => {
    try {
      const proof =  decodeProofToken(loginToken)
      if (proof.type !== 'login')
        throw new Error();
      return proof;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [loginToken]);

  const config = useConfig();
  const httpClient = createWebClient(fetch);
  const client = createClient(new URL(config.api.sesame.origin), httpClient, loginProof);

  const [user] = useAsync(async () => loginProof && client.user.get(loginProof.userId),[loginProof])

  if (!user)
    return null;

  const onClick = async () => {
    const { grant, secret } = await client.grants.identity.create(user.id, 'Cool Device!');
    const proof = createIdentityProof(grant, secret);
    onIdentityChange({ proof, version: 3 });
  }


  return [
    h('section', { class: styles.loginTokenSection }, [
      h('p', { class: styles.loginOfferText }, [
        `You have a Login Token for `,
        h('strong', {}, user.name)
      ]),
      //h('p', { class: styles.loginDescription }, `Login Tokens are "One Use". Once you use a login token, you cannot use it again, even on the same computer.`),
      //h(CopperButton, { onClick }, `Consume Token`)
      h(CopperButton, { onClick }, `Log Into Astral Atlas`)
    ]),
  ]
}

export const NotLoggedInControls/*: Component<NotLoggedInControlsProps>*/ = ({ onIdentityChange }) => {
  const url = new URL(document.location.href);
  const loginToken = url.searchParams.get("token");

  return [
    loginToken && h(UseTokenControls, { loginToken, onIdentityChange }),
    !loginToken && h('section', { class: styles.notLoggedInText }, [
      h('p', {}, `You need a valid token to Log In.`),
      h('p', {}, `Your administrator should be able to provide you with one.`),
    ]),
  ]
};
