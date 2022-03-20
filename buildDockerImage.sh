containerName="arduino-compiler"
networkName="custom0"
hostPort=50000
containerPort=1000
imageName="arduino-compiler"
tag="v1"

# Tagging to push image to a cloud registry
# $repo = "ta4h1r"
# docker tag ${imageName}:${tag} ${repo}/${imageName}:${tag}
# docker push ${repo}/${imageName}:${tag}

# Basic build and run
docker build -t ${imageName}:${tag} .
docker run -itd --name=$containerName --network=$networkName -p ${hostPort}:${containerPort} ${imageName}:${tag}
