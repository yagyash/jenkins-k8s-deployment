pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "registry.gitlab.com/your-namespace"
        REDIS_IMAGE = "${DOCKER_REGISTRY}/redis"
        WEB_IMAGE   = "${DOCKER_REGISTRY}/webapp"
        REDIS_TAG   = "v1.0"
        WEB_TAG     = "v1.0"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://gitlab.com/yagyash/jenkins-k8s-deployment.git'
            }
        }

        stage('Build & Push Redis Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-docker-creds',
                                                 usernameVariable: 'DOCKER_USER',
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" $DOCKER_REGISTRY --password-stdin
                      cd redis
                      docker build -t $REDIS_IMAGE:$REDIS_TAG .
                      docker push $REDIS_IMAGE:$REDIS_TAG
                    """
                }
            }
        }

        stage('Build & Push WebApp Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-docker-creds',
                                                 usernameVariable: 'DOCKER_USER',
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" $DOCKER_REGISTRY --password-stdin
                      cd web
                      docker build -t $WEB_IMAGE:$WEB_TAG .
                      docker push $WEB_IMAGE:$WEB_TAG
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'k8s-config']) {
                    sh """
                      kubectl apply -f redis/k8s-redis-deployment.yaml
                      kubectl apply -f web/k8s-web-deployment.yaml
                      kubectl rollout status deployment/redis
                      kubectl rollout status deployment/webapp
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed. Check logs."
        }
    }
}
