import React from 'react';
import bem, {makeBem} from 'js/bem';
import TextareaAutosize from 'react-autosize-textarea';
import './textBox.scss';

bem.TextBox = makeBem(null, 'text-box', 'label');
bem.TextBox__label = makeBem(bem.TextBox, 'label');
bem.TextBox__labelLink = makeBem(bem.TextBox, 'label-link', 'a');
bem.TextBox__input = makeBem(bem.TextBox, 'input', 'input');
bem.TextBox__description = makeBem(bem.TextBox, 'description');
bem.TextBox__error = makeBem(bem.TextBox, 'error');

export type AvailableType = 'email' | 'number' | 'password' | 'text-multiline' | 'text' | 'url';

const DefaultType: AvailableType = 'text';

interface TextBoxProps {
  type?: AvailableType;
  value: string;
  /** Not needed if `readOnly` */
  onChange?: Function;
  onBlur?: Function;
  onKeyPress?: Function;
  /**
   * Visual error indication and displaying error messages. Pass `true` to make
   * the input red. Pass string or multiple strings to also display
   * the error message(s).
   */
  errors?: string[] | boolean | string;
  label?: string;
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  disabled?: boolean;
  customModifiers?: string[]|string;
  'data-cy'?: string;
}

/**
 * A text box generic component.
 */
class TextBox extends React.Component<TextBoxProps, {}> {
  /**
   * NOTE: I needed to set `| any` for `onChange`, `onBlur` and `onKeyPress`
   * types to stop TextareaAutosize complaining.
   */

  onChange(evt: React.ChangeEvent<HTMLInputElement> | any) {
    if (this.props.readOnly || !this.props.onChange) {
      return;
    }
    this.props.onChange(evt.currentTarget.value);
  }

  onBlur(evt: React.FocusEvent<HTMLInputElement> | any) {
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(evt.currentTarget.value);
    }
  }

  onKeyPress(evt: React.KeyboardEvent<HTMLInputElement> | any) {
    if (typeof this.props.onKeyPress === 'function') {
      this.props.onKeyPress(evt.key, evt);
    }
  }

  render() {
    let modifiers = [];
    if (
      Array.isArray(this.props.customModifiers) &&
      typeof this.props.customModifiers[0] === 'string'
    ) {
      modifiers = this.props.customModifiers;
    } else if (typeof this.props.customModifiers === 'string') {
      modifiers.push(this.props.customModifiers);
    }

    let errors = [];
    if (Array.isArray(this.props.errors)) {
      errors = this.props.errors;
    } else if (typeof this.props.errors === 'string' && this.props.errors.length > 0) {
      errors.push(this.props.errors);
    }
    if (errors.length > 0 || this.props.errors === true) {
      modifiers.push('error');
    }

    let type = DefaultType;
    if (this.props.type) {
      type = this.props.type;
    }

    const inputProps = {
      value: this.props.value,
      placeholder: this.props.placeholder,
      onChange: this.onChange.bind(this),
      onBlur: this.onBlur.bind(this),
      onKeyPress: this.onKeyPress.bind(this),
      readOnly: this.props.readOnly,
      disabled: this.props.disabled,
      'data-cy': this.props['data-cy'],
    };

    return (
      <bem.TextBox m={modifiers}>
        {this.props.label &&
          <bem.TextBox__label>
            {this.props.label}
          </bem.TextBox__label>
        }

        {this.props.type === 'text-multiline' &&
          <TextareaAutosize
            className='text-box__input'
            {...inputProps}
          />
        }
        {this.props.type !== 'text-multiline' &&
          <bem.TextBox__input
            type={type}
            {...inputProps}
          />
        }

        {this.props.description &&
          <bem.TextBox__description>
            {this.props.description}
          </bem.TextBox__description>
        }

        {errors.length > 0 &&
          <bem.TextBox__error>
            {errors.map((message: string, index: number) => (
              <div key={`textbox-error-${index}`}>{message}</div>
            ))}
          </bem.TextBox__error>
        }
      </bem.TextBox>
    );
  }
}

export default TextBox;
