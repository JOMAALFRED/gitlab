pipeline {
    agent any

    /*
    triggers {
        pollSCM('* * * * *')
    }
    */

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME  = 'app-js'
        // Nettoyage du nom de branche pour convenir aux tags Docker
        BRANCH      = "${(env.BRANCH_NAME ?: 'main').replaceAll('[^A-Za-z0-9]', '-').toLowerCase()}"
        REACT_IMAGE = "${IMAGE_NAME}:${BRANCH}-${BUILD_NUMBER}"
        APP_PORT    = '8080' // Définition de la variable manquante
    }

    stages {

        stage('1. Security Scan (Semgrep)') {
           steps {
              catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
              sh '''
                 python3 -m pip install --user semgrep
                 export PATH="$HOME/.local/bin:$PATH"

                 semgrep --version
                 semgrep --config auto --error .
               '''
              }
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
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh '''
                        # Scan de l'image Docker avec Trivy
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.50.0 \
                            image --exit-code 1 --severity HIGH,CRITICAL $REACT_IMAGE

                        # Scan des dépendances avec OWASP Dependency-Check
                        docker run --rm -v "$PWD":/src owasp/dependency-check:latest \
                            --scan /src --failOnCVSS 9 --noupdate
                    '''
                }
            }
        }
    
        stage('4. Déploiement Compose') {
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
                    // Correction : Utilisation de la variable BRANCH définie dans environment
                    def composeFile = "docker-compose.${BRANCH}.yml"
                    
                    if (!fileExists(composeFile)) {
                        echo "Fichier ${composeFile} introuvable, utilisation de docker-compose.yml"
                        composeFile = 'docker-compose.yml'
                    }

                    sh """
                        docker compose -f ${composeFile} up -d --remove-orphans
                        docker compose -f ${composeFile} ps
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline OK : ${env.REACT_IMAGE} (branche ${BRANCH}, port ${env.APP_PORT})"
        }
        failure {
            echo 'Pipeline en échec, voir le stage rouge.'
        }
    }
}