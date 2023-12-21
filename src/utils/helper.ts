/*
 * 生成文件唯一id
 * @param file 文件
 */
export const generageFileId = (file: File) => `${file.name}__${file.size}__${file.lastModified}`;

/**
 * 判断文件是否重复
 * @param files 文件列表
 * @param newFile 新文件
 */
export const isRepeatFile = (files: File[], newFile: File) => {
  const map: Record<string, File> = {};
  for (let i = 0; i < files.length; i += 1) {
    map[generageFileId(files[i])] = files[i];
  }
  return map[generageFileId(newFile)];
};

/**
 * 将数组转为文件列表
 * @param files 文件数组
 */
export const arrayToFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });
  return dataTransfer.files;
};
