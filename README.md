# Serverless API with AWS CDK

A production-ready serverless REST API built with AWS CDK, Lambda, API Gateway, and DynamoDB. This project demonstrates modern cloud-native architecture with Infrastructure as Code, property-based testing via fast-check to ensure correctness invariants across randomized inputs, and complete CRUD operations.

## Architecture

```
Client → API Gateway → Lambda Functions → DynamoDB
```

**Components:**
- **API Gateway**: REST API with CORS enabled
- **Lambda Functions**: 5 Node.js handlers (create, list, get, update, delete)
- **DynamoDB**: NoSQL database with on-demand billing
- **IAM**: Least-privilege roles for Lambda execution

## Technologies

- **AWS CDK** - Infrastructure as Code (TypeScript)
- **AWS Lambda** - Serverless compute (Node.js 20)
- **AWS API Gateway** - REST API management
- **AWS DynamoDB** - NoSQL database
- **TypeScript** - Type-safe development
- **Jest** - Unit testing framework
- **fast-check** - Property-based testing

## Project Structure

```
.
├── infra/                  # CDK infrastructure code
│   ├── lib/
│   │   └── infra-stack.ts  # Main stack definition
│   ├── bin/
│   │   └── infra.ts        # CDK app entry point
│   └── test/               # Infrastructure tests
├── lambdas/                # Lambda function code
│   ├── createItem/
│   ├── listItems/
│   ├── getItem/
│   ├── updateItem/
│   ├── deleteItem/
│   ├── shared/             # Shared utilities
│   │   ├── db.ts           # DynamoDB client
│   │   ├── response.ts     # HTTP response helpers
│   │   └── types.ts        # TypeScript interfaces
│   └── __tests__/          # Unit and property tests
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- An AWS account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/luis-octavius/aws-serverless-api.git
cd serverless-api
```

2. Install dependencies for infrastructure:
```bash
cd infra
npm install
```

3. Install dependencies for Lambda functions:
```bash
cd ../lambdas
npm install
```

4. Install esbuild in the project root (required for Lambda bundling):
```bash
cd ..
npm init -y
npm install --save-dev esbuild
```

## Deployment

1. Bootstrap your AWS environment (first time only):
```bash
cd infra
npx cdk bootstrap
```

2. Deploy the stack:
```bash
npx cdk deploy
```

3. Note the API URL from the output:
```
Outputs:
InfraStack.ApiUrl = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

## API Usage

### Create Item
```bash
curl -X POST https://your-api-url/prod/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Example", "price": 29.99}'
```

Response:
```json
{
  "id": "uuid-here",
  "name": "Example",
  "price": 29.99
}
```

### List All Items
```bash
curl https://your-api-url/prod/items
```

Response:
```json
[
  {
    "id": "uuid-1",
    "name": "Example",
    "price": 29.99
  }
]
```

### Get Item by ID
```bash
curl https://your-api-url/prod/items/{id}
```

### Update Item
```bash
curl -X PUT https://your-api-url/prod/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Delete Item
```bash
curl -X DELETE https://your-api-url/prod/items/{id}
```

## Testing

### Run Lambda tests:
```bash
cd lambdas
npm test
```

This runs:
- Unit tests for all handlers
- Property-based tests (100 iterations per property)
- Round-trip integration tests

### Run infrastructure tests:
```bash
cd infra
npm test
```

### Type checking:
```bash
# Lambda functions
cd lambdas
npx tsc --noEmit

# Infrastructure
cd infra
npx tsc --noEmit
```

### Synthesize CloudFormation template:
```bash
cd infra
npx cdk synth
```

## Development

### Local testing
The Lambda handlers can be tested locally using Jest with mocked DynamoDB clients. See `lambdas/__tests__/` for examples.

### Adding new endpoints
1. Create a new handler in `lambdas/`
2. Add the Lambda function to `infra/lib/infra-stack.ts`
3. Map the route in API Gateway
4. Grant DynamoDB permissions
5. Write tests

## Cleanup

To avoid AWS charges, destroy the stack when done:

```bash
cd infra
npx cdk destroy
```

This removes all resources including:
- API Gateway
- Lambda functions
- DynamoDB table
- IAM roles

## Features

- **CORS enabled** - Ready for frontend integration
- **Error handling** - Consistent error responses with proper HTTP status codes
- **Input validation** - Request body and path parameter validation
- **Property-based testing** - Verified correctness properties with fast-check
- **Type safety** - Full TypeScript coverage
- **Infrastructure as Code** - Reproducible deployments with CDK

## License

MIT

## Author

[Luis Octávio](https://github.com/luis-octavius)
