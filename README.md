# cdktf-lambda

Example for how to create a TypeScript Lambda with cdktf. The Lambda itself would try to filter events coming from RDS Database Activity Stream.

## Setup

```bash
cdktf init --template="typescript"
cdktf provider add "aws@~>4.0"
```

```bash
cdktf get
```

Initialize the Lambda with:

```bash
cd src/lambda
npm install
```

## deploy

```bash
cdktf deploy
```

## destroy

```bash
cdktf destroy
```
