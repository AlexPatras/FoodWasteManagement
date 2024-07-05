## Implementation Folder

Welcome to the implementation folder of the project! Follow the steps below to get started with the project.

First, navigate to the `foodwastemanagement` folder:
### Installation

To install all the necessary dependencies, run the following command:

- npm i


### Starting the Website

After the dependencies have been installed, you can start the website with the following command:

- npm start

<br>This will start the development server and you can view the website in your browser.

### Additional Information

- Ensure you have Node.js and npm installed on your machine.


Script to create Docker-Container: 
docker run --name dbs_postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=123 -d postgres:latest
