# Slackmap V2 Proposal

**⚠️ Deadline: 11.02.2022**
## Intro

Slackmap v1 was developed by Piotr Błaszczak since forever. The Platform is userfed with line-data and has several tousand entries so far. Piotr stopped developing the platform in 2018 due to outdated stack and a shift in interests, the platform remains working with some major flaws that make further usage inconvenience (deletion of lines is not possible, line management not allowed, access restrictions can not be communicated, etc.)

## Project Scope

In broader concept, Slackmap v2 aims to:
- Act as a "topo" guide
- Provide global information for travelers
- alleviate access issues
- Form a contact between slackliners in interest and the regional communities & authorities (managers of the spot etc)
- It does **NOT** provide any `social media` oriented features where people can organize meetings, festivals, inform each other about the currently-active gatherings.

## Project Concerns

- Simplicity. It must focus on simplicity both in technical and presentational aspects simply because,
  - It needs to survive potentially decades with volunteered effort which requires long lasting motivation and organization and therefore minimal effort for everybody
  - It will receive countless requests and changes over time.  The maintenance will be an exponential burden as time goes on.
- Starting with MVP(minimal product). 
  - Initial development effort would be the biggest load for everyone. We must target a simple product to start with.
- Mainstream tech stack.
  - Its easier to on board volunteers when the tech stack follows the mainstream trends. It helps with motivation, learning curve etc...

## Technical Details
### Tech Stack
- Frontend
  - React, Typescript, Redux, Material-UI Kit(or similar). These are mainstream and good enough tools and framework with long term maintainability and ease of development
  - Free map provider(OpenStreetMap compatible)
  - Hosted in AWS Cloudfront
- Backend
  - AWS(Serverless Stack). No cost, years long maintainability, no devops etc, just focus on the application code.
    - Serverless Framework, Lambda, Cognito, SES, S3, etc whatever needed. 
  - Typescript/Node.js
  - Database
    - Dynamodb or MySQL. Each have nice trade-offs for the project. 
  - OpenAPI Specs
  - Stages: Dev, Prod
    - Multiple stages are quite costly and hard to maintain together

### User Management System
There has to be a user management system (currently facebook etc is used) but other projects like ranking list also requires the same, therefore a single user system for entire ISA products is the most sensible option, where people
- can use single email-password to login to their profiles
- can be assigned to multiple associations and clubs.
- can register on behalf associations and share their credentials inside their clubs to give permissions to their members to maintain their lines and spots etc. 

**This user system is out of the scope for slackmap. It will be carried out separately.**

### General concepts/entities 

- **Line:** A single line having sub-features
  - Type, ex: highline, waterline
  - Name
  - Length, height
  - Anchors and access to anchors
  - Gear and line specs
  - Established by
  - Media files like photos or videos
  - Contact information, ex: local club
  - Access details
  - Restriction details
  - Restriction level(partial, full)
- **Spot:** A groupings of several lines having sub-features
  - Name
  - Contact information, ex: local club
  - Access details
  - Restriction details
  - Restriction level(partial, full)
- **Association:** A ISA Member club
  - Basic info: name, location, logo (from ISA Account)
- **User:** An individual ISA Account User
- **Owner**: 
  - Each spot and line has to have only 1 owner. Initial creator is the owner.

### Initial Functionalities
- Users can only sign-in through ISA. No federated providers (simplicity)
- Users who initially create the line/spot will be the owner of the entity
  - Owners can transfer the ownership of the line/spot to another user (manually first)
- The association within the area will have editorship permissions for the lines/spots
- Every user can comment under the line/spot
- Owner can change the restriction severity for the line/spot
  - Partially-restricted: The popup will display warning info and upon closing that you can see the details
  - Fully-restricted: The popup will display warning info and no details will be shown
- User can query the line/spots based on
  - line/spot name, country, owner-name
- Map interface with minimal obstruction in the screen where people can navigate on the map to get an overview.
- Map offers a good quality satellite images
- Line/Spot creating and editing happens in separate page instead of a popup to provide a clear space to work on.
- Line and Spots are marked distinctively in the map.
- Associations will be marked on the map with their logos in their coordinates
- Creating the line supports drawing line on the map interactively with automatic distance measurement(suggestive only)
  
### Initial Roadmap

1) Agree on feature set and product details collectively,
2) Export the slackmap data and share with developers
3) Create front-end and back-end tasks
4) Assign tasks to developers
5) Evaluate the progress/feedback so far and create the next roadmap, development strategy, tasks etc..