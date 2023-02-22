import { join } from 'path';

export const getRootPath = () => join(process.cwd());
/* {
  
  return process.cwd();
};
 */
export const logPath = join(getRootPath(), 'logs');
export const publicPath = join(getRootPath(), 'client');
export const staticAssetsPath = join(getRootPath(), 'client/static');
export const uploadRootPath = join(getRootPath(), 'uploads');
export const getUploadPathWithYear = () => {
  return '/uploads/' + new Date().getFullYear();
};
