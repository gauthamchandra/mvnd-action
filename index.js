import * as core from '@actions/core';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const fetchAndSaveBinary = async (baseUrl, version, targetPath) => {
  try {
    let platformSuffix;

    switch(process.platform) {
      case 'win32':
        platformSuffix = 'windows-amd64';
        break;
      case 'darwin':
        platformSuffix = process.arch === 'arm64' ? 'darwin-aarch64' : 'darwin-amd64';
        break;
      case 'linux':
        platformSuffix = 'linux-amd64';
        break;
      default:
        core.warning(`Unknown platform detected: ${process.platform}. Defaulting to fetching linux variant`)
        platformSuffix = 'linux-amd64';
        break;
    }

    const url = new URL(baseUrl);
    url.pathname += `${version}/maven-mvnd-${version}-${platformSuffix}.zip`;

    core.info(`Fetching binary from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    core.info(`Writing to file: ${targetPath}`);
    await fs.writeFile(targetPath, buffer);

    // 0o755 = Owner: rwx, Group: r-x, Others: r-x
    // This is standard executable permission (read/write/execute for owner, read/execute for others)
    await fs.chmod(targetPath, 0o755);
    core.info(`Made file executable: ${targetPath}`);
  } catch (error) {
    core.error(`Failed to fetch and save mvnd binary: ${error.message}`);
    throw error;
  }
};

const fileExistsAndIsAccessible = async (path) => {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const createDirectoryIfNecessary = async (targetPath) => {
  const directory = path.dirname(targetPath);
  await fs.mkdir(directory, { recursive: true });
};

const addDirectoryToPath = (directoryPath) => {
  const absolutePath = path.resolve(directoryPath);

  // GitHub Actions specific way to modify PATH for all subsequent steps
  // See: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-system-path
  core.addPath(absolutePath);

  core.info(`Added ${absolutePath} to the PATH`);
};

const getTempDirectory = () => {
  // Prefer GitHub Actions temp directory if available, otherwise fallback to OS temp dir
  return process.env.RUNNER_TEMP || os.tmpdir();
};

try {
  const baseUrl = core.getInput('hosted-binary-url');
  const version = core.getInput('version');
  const saveDir = core.getInput('cache-directory-override') ?
    path.resolve(core.getInput('cache-directory-override')) :
    path.resolve(getTempDirectory(), 'mvnd-cache');
  const binaryName = process.platform === 'win32' ? 'mvnd.exe' : 'mvnd';
  const fullSavePath = path.join(saveDir, `/${binaryName}`);

  core.info(`Resolved target location for binary is: ${fullSavePath}`);

  if (await fileExistsAndIsAccessible(fullSavePath)) {
    core.info('File seems to already exist at the target location. Skipping fetch');
  } else {
    core.info(`No existing binary found at ${fullSavePath}.`);
    await createDirectoryIfNecessary(fullSavePath);
    await fetchAndSaveBinary(baseUrl, version, fullSavePath);
  }

  addDirectoryToPath(saveDir);
  core.setOutput('cached-binary-path', fullSavePath);
} catch (error) {
  core.setFailed(error.message);
}
