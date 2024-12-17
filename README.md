<p align="center">
    <img src="https://raw.githubusercontent.com/owl-app/timetracker/refs/heads/main/libs/app/core/src/assets/logo.webp" width="150px" alt="Owl logo" />
</p>

# Time tracker

Timetracker is an application built using NestJS, Vue, and Nx, with Role-Based Access Control (RBAC) integrated.

## Description

Timetracker allows for efficient time management and task tracking within a team. The project leverages a modular architecture to facilitate easy development and maintenance.

## Features

- Role-Based Access Control (RBAC)
- CRUD operations for managing data
- User authentication and authorization
- Project and time tracking
- Integration with various services

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/owl-app/timetracker.git
   cd timetracker
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the application:
   ```bash
   yarn start
   ```

## Usage

### Commands

- **Publish package**:

  ```bash
  npx nx run @owl-app/registry-nestjs:publish --version=0.0.1 --tag=0.0.1
  ```

- **Generate package**:

  ```bash
  npx nx generate @nx/js:library @owl-app/nestjs-query-core --directory=packages/query/core --publishable --importPath=@owl-app/nestjs-query-core
  ```

- **Generate library**:

  ```bash
  npx nx g @nx/nest:library --directory=libs/api/building-blocks --buildable=true
  ```

- **Build**:

  ```bash
  npx nx build @owl-app/nestjs-query-core --skip-nx-cache
  ```

- **APP**:

  ```bash
  yarn nx g @nx/vue:lib @owl-app/lib-app-module-rbac --directory=libs/app/modules/rbac
  ```

- **PM2**:
  ```bash
  pm2 start npm --name "timetracker" -- run start:build
  ```

## Contributing

If you wish to contribute to the project, please report issues and propose enhancements through [Issues](https://github.com/owl-app/timetracker/issues).

## License

This project does not have an assigned license.

If you have any additional details or specific sections you'd like to include, please let me know!
