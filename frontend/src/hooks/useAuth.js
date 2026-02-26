import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    logout: handleLogout,
  };
};