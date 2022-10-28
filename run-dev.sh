# docker run -p 27017:27017 --name mongodb-leyesabiertas -d mongo:3.6
systemctl start docker && docker start mongodb-leyesabiertas && npm run dev
