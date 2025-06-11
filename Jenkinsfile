// Jenkinsfile
// This defines a Declarative Pipeline for Jenkins

pipeline {
    // Specifies where the pipeline will run. 'any' means it can run on any available agent.
    agent {label 'application'}

    // Define environment variables that will be available throughout the pipeline
    environment {
        // Defines the Docker image name and tags it with the Jenkins build number
        DOCKER_IMAGE = "cicd-demo-app:${env.BUILD_NUMBER}"
        // Defines the name for the running Docker container
        CONTAINER_NAME = "cicd-demo-container"
    }

    // Define the stages of your CI/CD pipeline
    stages {
        stage('Checkout Code') {
            steps {
                echo "--- Checking out code from GitLab ---"
                // Clones the Git repository.
                // 'branch': Specifies the branch to clone (e.g., 'main' or 'master')
                // 'credentialsId': ID of the credentials configured in Jenkins for GitLab access
                // 'url': The URL of your GitLab repository
                git branch: 'main', 
                    credentialsId: 'gitlab', // <<--- IMPORTANT: REPLACE THIS
                    url: 'https://gitlab.com/dgruploads/Gitlab_Jenkins_collab.git' // <<--- IMPORTANT: REPLACE THIS
                echo "Code checked out successfully."
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "--- Building Docker image ---"
                script {
                    // Executes a shell command to build the Docker image
                    // '-t' tags the image with the defined DOCKER_IMAGE name
                    // '.' specifies the Dockerfile is in the current directory
                    sh "docker build -t ${DOCKER_IMAGE} ."
                }
                echo "Docker image ${DOCKER_IMAGE} built successfully."
            }
        }

        stage('Stop and Remove Old Container (if exists)') {
            steps {
                echo "--- Stopping and removing old container (if present) ---"
                script {
                    // Stops and removes the existing container with the same name
                    // '|| true' ensures the command doesn't fail the pipeline if the container doesn't exist
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                }
                echo "Old container removed."
            }
        }

        stage('Run Docker Container') {
            steps {
                echo "--- Running new Docker container ---"
                script {
                    // Runs the new Docker container
                    // '-d': runs in detached mode (in the background)
                    // '-p 3000:3000': maps port 3000 from the container to port 3000 on the Jenkins agent host
                    // '--name': assigns a specific name to the container
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}"
                }
                echo "New container ${CONTAINER_NAME} running on port 3000."
            }
        }
    }

    // Post-build actions (optional, but good for cleanup or notifications)
    post {
        always {
            echo "Pipeline finished. Build status: ${currentBuild.result}"
            // Example cleanup: remove the Docker image after a successful build
            // (You might want to keep images for a while in a real scenario)
            // script {
            //     sh "docker rmi ${DOCKER_IMAGE} || true"
            // }
        }
        success {
            echo "Pipeline executed successfully!"
            // You could add a step here to send a success notification to Slack/email
        }
        failure {
            echo "Pipeline failed!"
            // You could add a step here to send a failure notification
        }
    }
}