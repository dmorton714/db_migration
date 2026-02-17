Use feature flags to setup the DB Swap 


# First Step 

Much of this is new to you, so the first step is to get everything running. Install any needed software like python node etc. Use the sites to reference how to get them work if the readme doesn't work for you. 

- You will have to run everything in order or no data will be available on the site. 
- Note any time you make changes to the data or backend, you have to reboot node. 

# Second Step 

Switch to branch "docker" and this contains the docker container with the MySQL files. 

- If you haven't already download docker desktop 
- Then follow the directions in the README.md file and docker_notes.md
- Do some of the tests in the terminal to get the hang of whats going on. No data is in the DB by Default 

# Third Step 

Now we get into the meat of the project! 

You now have to figure out how you want to import the data into the DB. You can use a language you know already or even use the docker terminal in MySQL to load in the data. 
You will want to keep the same tables we have in the SQLite db. 
- If you do it in python you can update the ETL pipeline later and have the process automated! 
- You can also automate this other ways too. You will just have to figure out that part on your own. 

Research data types! When you set up tables columns need to be assigned a data type or you'll have problems. 
- Add the data to the database
- Make some test queries to see if everything is working correctly. 

# Forth Step 

Find all the queries in the backend and replicate them in the in MySQL. 

- It's important to save them as you get them figured out. You will need them in the next part. 
- When you see `?` in the query that is generic place holder. So if its `year == ?` the frontend will sent year over and its dynamic. 

# Final Step! 

Switch to `migration` branch! 

- Insert the queries into the spaces in the backend. 
- Turn "on" and "off" the feature flag noted
  - This will switch from the SQLite and MySQL database. 
  - This is used in production code to test new features and keep the old one easily accessible in-case things are broken etc. 