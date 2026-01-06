Docker 

navigate to docker folder:
```bash
cd MySQL
```

then run:
```bash
docker compose up -d
```
To safely shutdown docker 
```bash
docker compose down
```
to delete the volume to make updates to init file 
```bash
docker-compose down -v
```

Login info:
MYSQL_ROOT_PASSWORD: 'Password'  
MYSQL_DATABASE: shooting_db        
MYSQL_USER: dbuser               # non-root user
MYSQL_PASSWORD: dbpassword 

exit to quit sql container 
docker stop Shooting_DB

to verify docker is running:
```bash
docker ps
```
to view logs:
```bash
docker logs Shooting_DB
```
to enter the container to test queries:
```bash
docker exec -it Shooting_DB mysql -u dbuser -p shooting_db
```

to test if tables are in the container: 
```bash 
SHOW TABLES;
```

test data in tables:
```bash
SELECT * FROM Address LIMIT 5;
```
to leave the container:
```bash
exit
```