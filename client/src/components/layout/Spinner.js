import React, { Fragment } from 'react';
import spinner from './spinner.gif';

export default () => (
  <Fragment>
    <img
      src={spinner}
      style={{ width: '254px', margin: '100px auto', display: 'block' }}
      alt='Loading...'
    />
  </Fragment>
);
