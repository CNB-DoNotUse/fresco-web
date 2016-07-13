FROM node:5.6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Pre-reqs
RUN npm install -g gulp bower
COPY ["package.json", "bower.json", ".bowerrc", "/usr/src/app/"]

# Install Dependencies
RUN npm install
RUN bower --allow-root install

COPY . /usr/src/app

# Fix for weird-ass sass bullshit (gulp fails to compile a couple of files)
RUN bash ./fix_sass.sh

# Asset compile
RUN gulp "Master Build" --nowatch

# Configuration files
COPY ["./config/templates/base.json", "./config/templates/dev.json", "./config/templates/docker.json", "/usr/src/app/config/"]

CMD ["npm", "start"]

EXPOSE 3000
