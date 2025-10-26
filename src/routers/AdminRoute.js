import { RoleRoute } from './RoleRoute';

export const AdminRoute = ({ children }) => (
  <RoleRoute allowed={["Admin"]}>{children}</RoleRoute>
);

export default AdminRoute;
