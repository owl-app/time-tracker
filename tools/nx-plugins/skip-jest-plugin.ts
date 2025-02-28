import {
  CreateNodes,
  joinPathFragments,
  ProjectConfiguration,
  readJsonFile,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import {
  JestPluginOptions,
  createNodes as createJestNodes,
} from '@nx/jest/plugin';
import { readdirSync } from 'fs';

export const createNodes: CreateNodes<
  JestPluginOptions & { skipProjects: string[] }
> = [
  createJestNodes[0],
  async (configFilePath, options, context) => {
    const projectRoot = dirname(configFilePath);

    const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
    if (!siblingFiles.includes('project.json')) {
      return {};
    }

    const path = joinPathFragments(projectRoot, 'project.json');
    const projectJson = readJsonFile<ProjectConfiguration>(path);
    const projectName = projectJson.name;

    if (projectName && options?.skipProjects.includes(projectName)) {
      return {};
    }

    return createJestNodes[1](configFilePath, options, context);
  },
];
