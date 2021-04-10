// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
/*::
export type LabeledInputProps = {|
  label: string,
  value: mixed,
  placeholder?: string,
  type?: 'text' | 'number' | 'date',
  onChange?: any => mixed,
  onInput?: any => mixed,
|};
*/
export const LabeledInput = ({
  label, placeholder, type,
  value, onChange, onInput
}/*: LabeledInputProps*/)/*: Node*/ => {
  return h('label', {}, [
    h('p', {}, label),
    h('input', {
      type,
      placeholder: placeholder,
      onChange,
      onInput,
      value,
    })
  ])
}
/*::
export type LabeledTextInputProps = {|
  value: string,
  label: string,
  placeholder?: string,
  onTextChange?: string => mixed,
  onTextInput?: string => mixed,
|};
*/

export const LabeledTextInput = ({
  value, label,
  placeholder,
  onTextChange = () => {},
  onTextInput = () => {},
}/*: LabeledTextInputProps*/)/*: Node*/ => {
  const onChange = (event) => {
    onTextChange(event.currentTarget.value);
  };
  const onInput = (event) => {
    onTextChange(event.currentTarget.value);
  };
  return h(LabeledInput, { label, value, placeholder, onChange, onInput });
};