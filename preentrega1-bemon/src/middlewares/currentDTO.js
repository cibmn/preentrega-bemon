export const currentUserDTO = (user) => {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
  };
};
