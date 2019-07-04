import React, { useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';

const Dashboard = ({
  auth,
  profile: { profile, loading },
  getCurrentProfile
}) => {
  useEffect(() => {
    getCurrentProfile();
  }, []);

  const showLoading = (
    <Fragment>
      <Spinner />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48 }}>Loading...</p>
      </div>
    </Fragment>
  );

  return loading && profile === null ? (showLoading) : 
  
  <Fragment>
     <h1 class="large text-primary">
        Dashboard
      </h1>
      <p class="lead"><i class="fas fa-user"></i> Welcome {auth.user.name}</p>
  </Fragment>;
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { getCurrentProfile }
)(Dashboard);
