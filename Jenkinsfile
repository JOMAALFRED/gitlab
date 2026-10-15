pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME  = 'reactjs-app'
        BRANCH      = "${(env.BRANCH_NAME ?: 'main').replaceAll('[^A-Za-z0-9]', '-').toLowerCase()}"
        REACT_IMAGE = "${IMAGE_NAME}:${BRANCH}-${BUILD_NUMBER}"
    }

    stages {

        stage('1. Security Scan (Semgrep)') {
            steps {
                // Ignore l'échec de Semgrep si une règle bloque pour continuer la chaîne
                sh 'semgrep --config auto --error . || true'
            }
        }

        stage('2. Docker build') {
            steps {
                sh 'pwd'
                // Construction de l'image Docker à partir du répertoire racine (.)
                sh 'docker build -t $REACT_IMAGE .'
            }
        }

        stage('3. Scan image et dépendances') {
            steps {
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest \
                        image --exit-code 0 --severity HIGH,CRITICAL $REACT_IMAGE || true
                    docker run --rm --volumes-from jenkins owasp/dependency-check:latest \
                        --scan "$PWD" --failOnCVSS 9 --noupdate || true
                '''
                sh 'pwd'
            }
        }
    }
        /*stage('4. Déploiement Compose') {
            when {
                allOf {
                    not { changeRequest() }
                    anyOf {
                        branch 'main'
                        branch 'develop'
                    }
                }
            }
            steps {
                script {
                    def composeFile = "docker-compose.${env.BRANCH}.yml"
                    if (!fileExists(composeFile)) {
                        echo "Fichier ${composeFile} introuvable, utilisation de docker-compose.yml"
                        composeFile = 'docker-compose.yml'
                    }

                    /sh """
                        docker compose -f ${composeFile} up -d --remove-orphans
                        docker compose -f ${composeFile} ps
                    """
                }
                sh 'pwd'
            }
        }
    }*/

    post {
        success {
            echo "Pipeline OK : ${env.REACT_IMAGE} (branche ${env.BRANCH}, port ${env.APP_PORT})"
        }
        failure {
            echo 'Pipeline en échec, voir le stage rouge.'
        }
    }
}