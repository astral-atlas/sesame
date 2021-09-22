// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';

/*::
export type ChangeEvent<T: HTMLElement> = {
  ...Event,
  currentTarget: T,
};
*/

/*::
export type LabeledInputProps = {|
  label: string,
  value: mixed,
  placeholder?: string,
  disabled?: boolean,
  type?: 'text' | 'number' | 'date',
  onChange?: any => mixed,
  onInput?: any => mixed,
|};
*/
export const LabeledInput = ({
  label, placeholder, type,
  value, onChange, onInput,
  disabled,
}/*: LabeledInputProps*/)/*: Node*/ => {
  return h('label', {}, [
    h('p', {}, label),
    h('input', {
      type,
      disabled,
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
  disabled?: boolean,
  placeholder?: string,
  onTextChange?: string => mixed,
  onTextInput?: string => mixed,
|};
*/

export const LabeledTextInput = ({
  value, label,
  placeholder,
  disabled = false,
  onTextChange = () => {},
  onTextInput = () => {},
}/*: LabeledTextInputProps*/)/*: Node*/ => {
  const onChange = (event) => {
    onTextChange(event.currentTarget.value);
  };
  const onInput = (event) => {
    onTextChange(event.currentTarget.value);
  };
  return h(LabeledInput, { label, value, placeholder, onChange, onInput, disabled });
};

/*::
export type FormProps = {|
  onFormSubmit?: ChangeEvent<HTMLFormElement> => mixed,
  children: Node,
|};
*/

export const formStyle = `
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`;

export const Form = ({ onFormSubmit, children }/*: FormProps*/)/*: Node*/ => {
  const onSubmit = (e) => {
    e.preventDefault();
    onFormSubmit && onFormSubmit(e);
  };
  return h('form', { onSubmit, class: 'form' }, children)
};

/*::
export type FormLabeledSelectProps = {|
  options: { value: string, label: string }[],
  label: string,
  value: string,
  onSelectOption: string => mixed,
|};
*/

const css = ([a]) => a;

export const formLabeledSelectStyle/*: string*/ = css`
.form-label {
  display: flex;
  flex-direction: column;
}

.form-labeled-select {
  margin-top: 8px;
  font-size: 16px;
  padding: 16px;

  border: 1px solid black;
  border-radius: 8px;
}
`;

export const FormLabeledSelect = ({ options, value, label, onSelectOption }/*: FormLabeledSelectProps*/)/*: Node*/ => {
  const onChange = (event/*: ChangeEvent<HTMLSelectElement>*/) => {
    onSelectOption(event.currentTarget.value);
  };
  return h('label', { class: 'form-label' }, [
    label,
    h('select', { value, onChange, class: 'form-labeled-select' }, options.map(({ label, value }) => h('option', { value }, label)))
  ])
};


/*::
export type FormHintProps = {|
  tone?: 'warning' | 'info' | 'error', 
  children: Node,
|};
*/

export const formHintStyle = `
.form-hint {
  display: flex;
  flex-direction: column;
  width: calc(256px + 128px);

  margin: 16px 32px 16px 32px;
  padding: 16px;
  
  border-radius: 8px;
  border: 2px solid;
  background-color: #b8ea7b;
}
.form-hint.info {
  border-color: #a3e18c;
  background-color: #b8ea7b;
}
.form-hint.warning {
  border-color: #ffbf45;
  background-color: #ffde8f;
}
.form-hint.error {
  border-color: #fd544c;
  background-color: #c61425;
  color: #fff;
}
.form-hint > p {
  margin: 4px;
  text-align: center;
}
`;

export const FormHint = ({ children, tone = 'info' }/*: FormHintProps*/)/*: Node*/ => {
  return h('article', { class: ['form-hint', tone].join(' ') }, children);
};

export const styles = [
  formHintStyle,
  formLabeledSelectStyle,
  formStyle,
];