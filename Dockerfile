# Use an official Node.js runtime as a parent image
# Using the LTS (Long Term Support) version is generally recommended
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If using yarn, uncomment the next line and comment out the npm ci line
# COPY yarn.lock ./

# Install app dependencies using npm ci for faster, more reliable builds
# If using yarn, replace 'npm ci' with 'yarn install --frozen-lockfile'
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Define the command to run your bot
CMD [ "node", "index.js" ] 