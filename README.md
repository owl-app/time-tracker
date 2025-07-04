<p align="center">
    <img src="https://raw.githubusercontent.com/owl-app/time-tracker/refs/heads/main/libs/app/core/src/assets/logo.webp" width="150px" alt="Owl logo" />
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

3. Copy .env file for your development environment and set variables:

   ```bash
   cp .env .env.development
   ```

4. Run seeder to create default users:

   ```bash
   yarn data:sync --envFile .env.development
   ```

5. Start the application:
   ```bash
   yarn start
   ```

6. Login:

      Admin system:
      ```bash
      l: admin_system_1@example.com
      p: test
      ```

      Admin company:
      ```bash
      l: admin_company_1@example.com
      p: test
      ```

      User:
      ```bash
      l: user_1@example.com
      p: test
      ```

## Contributing

If you wish to contribute to the project, please report issues and propose enhancements through [Issues](https://github.com/owl-app/timetracker/issues).

## License

OWL Time tracker is completely free and released under the [MIT License](https://github.com/owl-app/time-tracker/blob/main/LICENSE).

If you have any additional details or specific sections you'd like to include, please let me know!
