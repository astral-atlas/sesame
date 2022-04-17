// @flow strict

import { h } from "@lukekaalim/act";
import { render } from "@lukekaalim/act-three";

import { SesameAdmin } from "./SesameAdmin";

const entry = () => {
  const body = document.body;
  if (!body)
    throw new Error(`Document has no body`);

  render(h(SesameAdmin), body);
};

entry();