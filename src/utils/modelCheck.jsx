import { exists } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

export async function checkModelDownloaded(path, folderName) {
  const folderPath = await join(path, folderName);
  const folderExists = await exists(folderPath);
  if (!folderExists) {
    return false;
  }
  const binFile = await join(folderPath, "openvino_model.bin");
  const xmlFile = await join(folderPath, "openvino_model.xml");
  const binExists = await exists(binFile);
  const xmlExists = await exists(xmlFile);
  return binExists && xmlExists;
}
