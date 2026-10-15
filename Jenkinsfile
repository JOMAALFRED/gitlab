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
    IMAGE_NAME           = 'reactjs-app'
    BRANCH               = "${(env.BRANCH_NAME ?: 'main').replaceAll('[^A-Za-z0-9]', '-').toLowerCase()}"
    REACT_IMAGE          = "${IMAGE_NAME}:${BRANCH}-${BUILD_NUMBER}"
    APP_PORT             = "${BRANCH == 'main' ? '3000' : '3001'}"
    COMPOSE_PROJECT_NAME = "reactjs-${BRANCH}"
  }

  stages {

    stage('Security Scan (Semgrep)') {
      steps {
          // En ajoutant '|| true', Jenkins ignore l'échec de Semgrep et continue le build
          sh 'semgrep --config auto --error . || true'
        }
    }

    /*stage('1. SAST') {
    /  steps {
      //  sh '''
          pip install --user semgrep
          export PATH="$HOME/.local/bin:$PATH"
          semgrep --config auto --error .
          docker run --rm --volumes-from jenkins zricethezav/gitleaks:latest detect --source "$PWD" --no-banner
        '''
      }
   }*/

   stage('2. Docker build') {
      steps {
        sh 'pwd'
        // Remplacer ./reactjs-app par .
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
        sh ' pwd '
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
            // Détermine le nom du fichier compose selon la branche (ex: docker-compose.main.yml ou docker-compose.yml)
            def composeFile = "docker-compose.${env.BRANCH}.yml"
            def fileExists = fileExists(composeFile)
            
            // Si le fichier spécifique à la branche n'existe pas, utilise le docker-compose.yml par défaut
            if (!fileExists) {
                echo "Le fichier ${composeFile} n'existe pas, bascule sur docker-compose.yml"
                composeFile = 'docker-compose.yml'
            }

            echo "Déploiement en cours avec ${composeFile}..."

            sh """
                docker compose -f ${composeFile} up -d --remove-orphans
                docker compose -f ${composeFile} ps
            """
        }
        sh 'pwd'
    }
}

  post {
    success { echo "Pipeline OK : $REACT_IMAGE (branche $BRANCH, port $APP_PORT)" }
    failure { echo 'Pipeline en échec, voir le stage rouge.' }
  }
}