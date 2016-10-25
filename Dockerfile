# Derive from node version
FROM node:6.3.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Pre-reqs
RUN npm install -g bower pm2
COPY ["package.json", "bower.json", "/usr/src/app/"]

# Install Dependencies
RUN npm install
RUN bower --allow-root install

# Copy App bundle
COPY . /usr/src/app

# Configuration files
COPY ["./config/templates/base.json", "./config/templates/dev.json", "/usr/src/app/config/"]

# Asset compile with webpack in production mode
RUN npm run buildProd

# Start node webserver
CMD ["npm", "start"]

# Expose the port the node process is listening on
EXPOSE 3000