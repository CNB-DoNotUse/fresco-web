FROM node:4.2.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g gulp bower
COPY ["package.json", "bower.json", ".bowerrc", "/usr/src/app/"]
RUN npm install
RUN bower --allow-root install
COPY . /usr/src/app
RUN bash ./fix_sass.sh
RUN gulp "Master Build" --nowatch

CMD ["npm", "start"]

EXPOSE 3000
