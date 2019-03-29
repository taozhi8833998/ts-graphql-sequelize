# Api Boilerplate Using typescript, graphql and sequelize

## Install Dependencies

```bash
npm install
```

## Config your info in etc

- update the `config.default.yaml` and `config.{env}.yaml` according your env

- **For Secruty Config, you could touch .env.json in project root folder**, the project will loaded it into `process.env.RUNTIME_CFG` automatically

## Update Models, Schemas and Resolvers

- update the models, schemas and resolvers based on your bussiness and database info

## Start the Server

```bash
npm start
```

## Run Tests

- when develop push codes, tests run automatically

```bash
npm test
```

## Build Docker Image

```bash
make build env={env} name={name} // build image based on env
```