import { join } from 'path';
import fs from 'fs';

import { getUploadPathWithYear, publicPath } from './path.util';
const writeFile = (filepath: fs.PathOrFileDescriptor, data: any) => {
  new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, (err) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

export const creteUploadFile = async (fileName: string, fileBuffer: Buffer) => {
  const _uploadPath = getUploadPathWithYear();
  const basePath = join(publicPath, _uploadPath);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  await writeFile(basePath + '/' + fileName, fileBuffer);
  const url = _uploadPath + '/' + fileName;
  return url;
};
