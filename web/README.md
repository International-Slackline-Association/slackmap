# SlackMap UI

Web application of the SlackMap.

## Building Blocks

- React
  - Its bootstrapped with vitejs.
- Redux
  - Redux toolkit and RTK Query is used for state management and data fetching.
- Material UI
  - All the UI components are from MUI and try to follow the best practices like theming etc.
- AWS Amplify
  - Authentication with AWS Cognito
  - Basic Analytics with AWS Pinpoint and AWS RUM
- Typescript
  - Everything is made with TS and strict mode is enabled to make sure the code is type safe and easy to maintain for long time.
- Mapbox
  - Mapbox GL JS and React Map GL (wrapper) is used for map rendering and everything related to map. It's essential to read **ALL** the docs of Mapbox GL JS to understand how it works. Checkout examples from React Map GL as well.
- Hosting
  - Webapp is hosted with Cloudfront/S3.

## Development

### Folder Structure
- app
  - api
    -  Rest api and types for RTK Query. They contain all the calls and operations to the web api.
  - Anything related to the app itself like components pages etc.
  - pages
    - Represents basically every path in the application and the components inside are related to what you see what you visit the page
  - components
    - mutual components used in multiple pages
- store
  - Things related with redux and redux toolkit. No need to touch. Won't change frequently.
- styles
  - Generic MUI styles. No need to touch. Won't change frequently.
- utils
  - common functionalities used all over the application.

**Read the documentation of the libraries used in the project to understand how they work. Especially Redux Toolkit, MUI and MapboxGL JS.**

### Running Locally

1. `npm install`
2. create `.env.development` file in the root directory and look at the `.env.example` file for the required variables. Ask from us for the values.
3. `npm start` to start the app. It uses the development stage not the production stage data so you can add anything you want freely.

