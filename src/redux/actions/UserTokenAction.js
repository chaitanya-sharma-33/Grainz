export const UserTokenAction = token => {
  try {
    return async dispatch => {
      dispatch({type: 'STORE_TOKEN', payload: token});
    };
  } catch (error) {
    console.warn('error===>', error);
  }
};
