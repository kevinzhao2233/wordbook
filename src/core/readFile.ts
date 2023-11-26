interface IReadFileReturn {
  raw: string;
  type: string;
}

export const readFile = (file: File) => new Promise<IReadFileReturn>((resolve, reject) => {
  const fileType = file.name.split('.').pop() as string;
  const reader = new FileReader();
  reader.readAsText(file, 'utf-8');
  reader.onload = () => {
    if (reader.result === null) { return; }
    resolve({ raw: reader.result as string, type: fileType });
  };
  reader.onerror = () => {
    console.warn('文件读取失败', reader.error);
    reject(reader.error);
  };
});
