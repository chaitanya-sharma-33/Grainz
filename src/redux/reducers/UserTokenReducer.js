const UserTokenReducer = (state = null, action) => {
  if (action.type === 'STORE_TOKEN') {
    return action.payload;
  } else {
    return state;
  }
};

export default UserTokenReducer;
