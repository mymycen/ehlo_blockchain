import React from 'react';
import { Field, reduxForm } from 'redux-form';

const AddRecipient = props => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Ethereum address</label>
        <div>
          <Field
            name="ETH Address"
            component="input"
            type="text"
            placeholder="ETH Address"
          />
        </div>
      </div>
      <div>
        <label>BloodType</label>
        <div>
        <label>
          <Field name="blood" component="input" type="radio" value="A" />
          {' '}
          A
          </label>
        <label>
          <Field name="blood" component="input" type="radio" value="B" />
          {' '}
          B
          </label>
        <label>
          <Field name="blood" component="input" type="radio" value="AB" />
          {' '}
          AB
          </label>
        <label>
          <Field name="blood" component="input" type="radio" value="O" />
          {' '}
          O
          </label>
          </div>
      </div>
      <div>
        <label>Age</label>
        <div>
          <label>
            <Field name="age" component="input" type="radio" value="over18" />
            {' '}
            >18
          </label>
          <label>
            <Field name="age" component="input" type="radio" value="below18" />
            {' '}
            0-18
          </label>
        </div>
      </div>
      <div>
        <label>HLA</label>
        <div>
          <label>
            <Field name="hla" component="input" type="radio" value="HLA-DPA1" />
            {' '}
            HLA-DPA1
          </label>
          <label>
            <Field name="hla" component="input" type="radio" value="HLA-DPB1" />
            {' '}
            HLA-DPB1
          </label>
          <label>
            <Field name="hla" component="input" type="radio" value="HLA-DQA1" />
            {' '}
            HLA-DQA1
          </label>
          <label>
            <Field name="blood" component="input" type="radio" value="HLA-DQB1" />
            {' '}
            HLA-DQB1
          </label>
          <label>
            <Field name="blood" component="input" type="radio" value="HLA-DRB1" />
            {' '}
            HLA-DRB1
          </label>
          <label>
            <Field name="blood" component="input" type="radio" value="HLA-DRA" />
            {' '}
            HLA-DRA
          </label>
        </div>
      </div>
      <div>
        <label>Country</label>
        <div>
          <Field name="country" component="select" src="countries.js">
            <option />
            <option value="country"></option>
          </Field>
        </div>
      </div>
        <div>
          <label>Region</label>
          <div>
            <Field
              name="region"
              component="input"
              type="text"
              placeholder="Region code"
            />
          </div>
        </div>

      <div>
        <label>Status</label>
        <div>
          <Field name="notes" component="textarea" />
        </div>
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>Submit</button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>
          Clear Values
        </button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'simple', // a unique identifier for this form
})(AddRecipient);
