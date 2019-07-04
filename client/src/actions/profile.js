import axios from 'axios';
import { setAlert } from './alert'
import { GET_PROFILE, PROFILE_ERROR } from './types'

// Get the current user profile
export const getCurrentProfile = () => async dispatch => {
  try {
    const res = await axios.get('/api/v1/profiles/me');
    
    dispatch({
      type: GET_PROFILE,
      payload: res.data
    })

  } catch (err) {
    console.error(err.message);
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
}