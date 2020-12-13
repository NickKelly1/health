# https://blog.container-solutions.com/tagging-docker-images-the-right-way
NAME		:= nick3141/health
# tag as git commit:
# TAG 		:= $$(git log -1 --pretty=%h)
# tag as package.json version:
# https://gist.github.com/DarrenN/8c6a5b969481725a4413
TAG 		:= $$(cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
IMG			:= ${NAME}:${TAG}
LATEST	:= ${NAME}:latest

echo-tag:
	echo ${TAG}

build:
	docker build -t ${IMG} .
	docker tag ${IMG} ${LATEST}

build-no-cache:
	docker build --no-cache=true -t ${IMG} .
	docker tag ${IMG} ${LATEST}

push:
	docker push ${NAME}

pull:
	docker pull ${NAME}

login:
	docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}

up-d:
	docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d

rm:
	docker image rm nick3141/health

reload-stop:
	docker stop health
	docker rm health
	docker image rm ${NAME}

reload-git:
	git pull

reload:
	make reload-stop
	make reload-git
	make up-d

# separated from deploy-docker b/c sometimes need sudo for docker, but don't want for git
deploy-git:
	git add .
	git commit -m "deploy"
	git push

# separated from deploy-git b/c sometimes need sudo for docker, but don't want for git
deploy-docker:
	make build
	make push

deploy:
	make deploy-git
	make deploy-docker