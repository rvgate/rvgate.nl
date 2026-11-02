install:
	npm install

run/devserver:
	npm run dev

# contact form backend for development: prints the e-mails instead of sending them
run/api:
	DRY_RUN=1 python3 api/contact.py

build:
	npm run build

docker/build:
	docker build -t rvgate-nl:latest -f Dockerfile .

docker/run:
	docker run --rm -p 8080:80 rvgate-nl:latest

# the whole stack (site + contact backend) like on the server; needs a .env
docker/up:
	docker compose up --build
