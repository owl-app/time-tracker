import { readdirSync } from 'fs';
import { dirname, join } from 'path';

import { CreateNodesV2, joinPathFragments, ProjectConfiguration, readJsonFile } from '@nx/devkit';
import { JestPluginOptions, createNodesV2 as createJestNodesV2 } from '@nx/jest/plugin';

export const createNodesV2: CreateNodesV2<JestPluginOptions & { skipProjects: string[] }> = [
  createJestNodesV2[0],
  async (allConfigFiles, options, context) => {
    const configFiles: string[] = [];
    const errors: Array<[file: string, error: Error]> = [];

    await Promise.all(
      allConfigFiles.map(async (file) => {
        try {
          const projectRoot = dirname(file);
          const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));

          if (siblingFiles.includes('project.json')) {
            const path = joinPathFragments(projectRoot, 'project.json');
            const projectJson = readJsonFile<ProjectConfiguration>(path);
            const projectName = projectJson.name ?? '';

            if (!options?.skipProjects.includes(projectName)) {
              configFiles.push(file);
            }
          }
        } catch (e) {
          errors.push([file, e] as const);
        }
      })
    );

    if (errors.length > 0) {
      throw new Error(
        `Failed to read the following configuration files:\n
        ${errors.map(([file, error]) => `${file}: ${error.message}`).join('\n')}`
      );
    }

    // Exclude by projectRoot
    //
    // const nodesResult = await createNodesFromFiles(createJestNodesV2[1], files, options, context);

    // nodesResult.map((nodeResult, index) => {
    //   if (nodeResult[1]?.projects !== undefined) {
    //     const projects: Record<string, Optional<ProjectConfiguration, 'root'>> = {};

    //     Object.keys(nodeResult[1].projects).forEach(function (key) {
    //       const project = nodeResult[1].projects ? nodeResult[1].projects[key] : undefined;

    //       if (project !== undefined && !options?.skipProjects.includes(project.name ?? '')) {
    //         projects[key] = project;
    //       }
    //     });

    //     nodesResult[index][1].projects = projects;
    //   }
    // });

    // return nodesResult;

    return await createJestNodesV2[1](configFiles, options, context);
  },
];
