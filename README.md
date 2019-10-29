#### Description:

This is the Nodejs Backend REST Web Application to create and search for volunteering opportunities.

This was coded as part of an interview assignment.

#### Given Requirements:

Build a simple mobile responsive web app that allows the user to do the following:

1. Create a volunteering opportunity. Suggested fields: email, opportunity title, opportunity
   description, location (includes city-area/address), day/time (from-to/specific day, no. of
   hours/day)
2. Discover volunteering opportunities in the most intuitive way.
3. [Bonus] Sign up for a particular opportunity they’re interested in. Suggested fields: Email,
   Mobile, Time commitment, a short note about why they want to volunteer and/or any
   previous volunteering experience.
4. [Bonus] Get an email if any user signs up for an opportunity created by him/her, which
   includes all details filled by the volunteering candidate.

#### Deployment:

1. Make sure mongodb database is ready and running.
   MongoDb connection details:

   - username: volunteerAppDbRwUser
   - password: teachForIndia123
   - database_name: volunteerAppDb
   - connection_string: mongodb+srv://volunteerAppDbRwUser:teachForIndia123@qureshcluster0-jrzir.mongodb.net/volunteerAppDb?retryWrites=true&w=majority

2. Make sure staff user with credentials "username" : "staff", "password" : "staff" is added to the "User" collection in the mongodb database.

3. Before running the app, set the environment variables.

   1. ql_volunteer_app_be_db must be set to the mongodb connection_string.
   2. ql_volunteer_app_be_jwtPrivateKey must be set to a private key of your choice.
   3. PORT must be set to the port number on which you want to start the web server.

4. Run the app using "node index.js" in the application root folder.

5. Access the app at http://localhost:3900/api or whatever port it was started on.

6. Heroku Deployment Url: https://ql-simple-volunteer-mgmt-app.herokuapp.com/api

#### Implementation:

The following REST api routes are implemented:

Opportunities:

1. HTTP GET - /opportunities?keywords=&email=&loc_area=&loc_city=&sch_fromDate=&sch_toDate=&sch_maxDurationDays=&sch_maxHoursPerDay=

2. HTTP GET - /opportunities/:id

3. HTTP PUT - /opportunities/:id

4. HTTP DELETE - /opportunities/:id

5. HTTP POST - /opportunities

Authentication:

1. post /auth
