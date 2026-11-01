install:
	npm install

run/devserver:
	npm run dev

build:
	npm run build

docker/build:
	docker build -t rvgate-nl:latest -f Dockerfile .

docker/run:
	docker run --rm -p 8080:80 rvgate-nl:latest
