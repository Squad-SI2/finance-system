import { productsHandlers } from './products.handlers';
import { authHandlers } from './auth.handlers';
import { usersHandlers } from './users.handlers';
import { dashboardHandlers } from './dashboard.handlers';
import { publicHandlers } from './public.handlers';

export const handlers = [
  ...productsHandlers,
  ...authHandlers,
  ...usersHandlers,
  ...dashboardHandlers,
  ...publicHandlers,
];