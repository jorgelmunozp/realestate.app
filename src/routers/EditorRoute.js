import { RoleRoute } from './RoleRoute';

export const EditorRoute = ({ children }) => (
  <RoleRoute allowed={["Editor"]}>{children}</RoleRoute>
);

export default EditorRoute;
