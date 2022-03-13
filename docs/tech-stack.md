# Discussing Tech Stack

## Language

Typescript. No need for discussion I guess. Everything should be typed since this project needs to survive for years and nobody wants to figure out what the previous developer did. We should aim for self-documented, clear and SUPER simple coding practices.

## Infrastructure

### Tool Stack

Everything will be on AWS. Its by far the best cloud service and some of us are really experienced with it.

Using

- **APIGateway**: Rest APIs
- **Lambda**: For all the application code
- **IAM**: For access permissions and policies users will have (ownership concept)
- **Cloudwatch**: For all the logs, metrics and alarms
- **Cognito**: For user management
- **S3**: For storing media content
- **SES**: For sending emails to users
- **Dynamodb or Aurora(mysql)**: For database
- **Pinpoint**: For analytics and usage reports
- **Cloudfront**: Hosting web app

### Trade-offs between DynamoDB(NoSQL) and Aurora(mysql)

Personally(Can) I am 100% confident slackmap data can be handled with dynamodb considering all the advantages we get and sacrificing little. However, dynamodb can be strange at first for unexperienced people. The only downside is, as for all NoSQL, it requires solid design for all the data access patterns.

⚠️ NoSQL has a well known but **WRONG** reputation that it is only for non-relation data. There are incredible data structures made with NoSQL which would seem impossible at first. It requires different mindset only.

**Some trade-off in simpler terms:**

|                     |                                     Dynamodb                                     |                     Aurora                     |
| :-----------------: | :------------------------------------------------------------------------------: | :--------------------------------------------: |
|    Cost(Monthly)    |                            ~5$(serverless)                            |            70$+ for small instance             |
| Cost for developer  |             None. Auto backups/recovery, seamless lambda integration             |         Small, needs work with lambda          |
|     Performance     |                              Unlimited, super fast                               |   Limited to instance, but still super fast    |
| Cost of development | Requires upfront planning for data, hard to adjust to changing querying patterns | Simple to formulate data and changing patterns |
|   Ease of coding    |       Easy in node.js but could be very strange for unfamiliar developers        |                  Classic ORM                   |

### IaC and Deployment

Serverless framework serves to all our needs and is quite famous. Using serverless framework for managing the infrastructure should be good enough. There will be 2 stages **dev** and **prod**. Managing multiple stages is quite painful when its not your full time work. Also it becomes quite expensive and we are limited for that.

## Front-end

Using;

- React
- Redux
  - State management and pretty much defacto for all the web apps.
- Material UI
  - Most mature and adopted react component framework. Everything becomes much easier and maintainable. 
  - Very wide usage, supports, components, customizable etc..
- AWS Amplify
  - For accessing aws (user login, media upload, analytics etc...)

### Need for React framework?

As our first concern of the project is **simplicity**, it would be best to avoid everything possible. Frameworks like NextJs, Nuxt etc are quite handy and fun first but becomes so much burden as the time goes on. The project is simple enough to rely on create-react-app (which is the most used one in the React world) only. Client-side rendering has no disadvantage for the project anyway.

## Back-end

- AWS Lambda takes all the problems away and we just need to code the application logic it self sitting behind the rest api.
- Serverless Framework will be deploying.
- Serverless Framework can be used for running rest apis locally for testing.

### CI/CID?

None at first. Manually deployment works. We aren't gonna deploy everyday anyway. We can discuss it once we write full tests. 


### Need for Rest API Framework?

For the **simplicity**, it would be best if you free our codebase from any complicated tools. Using Nest.js is fun and professional but comes with much hidden cost, extra complexity. This grows in time and returns as maintenance duties as it nest.js moves so fast. Quite honestly, NOBODY will ever volunteer for legacy tools and the maintenance will be always the biggest problem. Express.js combined with clean coding can easily served projects way more complicated than slackmap and it could be the best for us as well.

## Development

### Testing

Unit testing is a DREAM for volunteered work. However, we should write tests that run on production environment to make sure core functionality is still working. There are strategies for this, that can be discussed later.

### Repository Structure & Practices

Monorepo tools are quite handy but again we shouldn't over-engineer tools. Monorepo projects requires lot of boilerplate scripts and maintenance and frequent practice. Even after 3-4 weeks people can easily forget what was the steps for running deploying etc. Plus, I see NO advantage for slackmap. We won't have dependent modules, multiple packages, deployments what not. Simple UI repo and and simple Back-end repo would do the job. 

### Pull Requests & Merging & Deploying

Initial code base should be set with 1-2 people max. Its a task where you can't work in parallel unfortunately. When the actual development starts we should work in branches. Everybody works in feature branch and last we squash merge it for clean history. PR should be reviewed by at least on other person. All the development goes into `dev` branch first. `main` branch is only for deployed version. There will be so money requests and bugs coming so that everybody knows `main` is the source and we keep it clean. 