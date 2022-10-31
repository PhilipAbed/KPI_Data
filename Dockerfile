FROM ubuntu:20.04

CMD ["/bin/bash"]

# Install curl, git
RUN apt-get update && \
  apt-get install -y curl && \
  apt-get install -y git && \
  apt-get clean

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
	apt-get install -y nodejs

RUN git clone https://github.com/PhilipAbed/KPI_Data.git

WORKDIR /KPI_Data

RUN npm install && \
	npm run compile:ts

ENTRYPOINT ["node", "dist/app.js"]