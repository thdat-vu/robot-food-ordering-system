#!/bin/bash

set -e

IMAGE_NAME=nhattruong075/mobile
TAG=latest

echo "🔧 Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

echo "🔑 Logging in Docker Hub..."
docker login

echo "📦 Pushing Docker image..."
docker push $IMAGE_NAME:$TAG

echo "✅ Done! Image pushed to Docker Hub: $IMAGE_NAME:$TAG"