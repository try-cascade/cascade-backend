# Base image
FROM node:16.15.0
# Set working directory so that all subsequent command runs in this folder
WORKDIR /usr/src/app
# Copy package json and install dependencies
COPY package*.json ./
RUN npm install
# Copy package json of cdktf, and install cdktf, ts, terraform, and other dependencies
COPY cdktf/package*.json cdktf/
RUN npm install -g cdktf-cli && cdktf --version
RUN npm install -g typescript
RUN \
cd ./cdktf && \
apt-get update -y && \
apt-get install unzip -y && \
apt-get install wget -y && \
wget https://releases.hashicorp.com/terraform/1.3.5/terraform_1.3.5_linux_amd64.zip && \
unzip terraform_1.3.5_linux_amd64.zip && \
mv terraform /usr/local/bin/ && \
terraform --version && \
npm install
# Copy our app into the image
COPY . .
# Expose port to access server
EXPOSE 3005
# Command to run our app
CMD ["npm", "start"]