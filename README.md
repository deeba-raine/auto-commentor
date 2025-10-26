# auto-commentor
instructions for setting up nodeJS and running project

1. Install Docker Desktop or Docker CLI + the Docker Compose Plugin
2. Clone this repository: git clone https://github.com/<your-username>/auto-commentor.git
3. Once inside the auto-commentor/src directory, run docker-compose up --build
 This command will build all three necessary program containers, start the services on a shared Docker network, and expose the frontend to be interacted with on your web browser.
4. Open your web browser and go to http://localhost:3000