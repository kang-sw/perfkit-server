FROM ubuntu:20.04

RUN apt-get update && apt-get install -y nginx

COPY build /root/dashboard
COPY docker /

ENTRYPOINT nginx && /bin/bash
