import * as fc from 'fast-check';

jest.mock('../shared/db', () => ({
    docClient: { send: jest.fn() },
    TABLE_NAME: 'test-table'
}))

import { handler as createHandler } from '../createItem/index';
import { handler as getHandler } from '../getItem/index';
import { docClient } from '../shared/db';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

test('Property 4: round-trip preserva dados', async () => {
    await fc.assert(
        fc.asyncProperty(fc.object({
            values: [fc.string(), fc.boolean(), fc.constant(null), fc.integer()]
        }), async (inputBody) => {
            const db: Record<string, any> = {};

            (docClient.send as jest.Mock).mockImplementation((command) => {
                if (command instanceof PutCommand) {
                    db[command.input.Item!.id] = command.input.Item
                    return Promise.resolve({})
                }

                if (command instanceof GetCommand) {
                    return Promise.resolve({ Item: db[command.input.Key!.id] })
                }
            })

            const createEvent = {
                body: JSON.stringify(inputBody),
                pathParameters: null
            } as any 

            const createResponse = await createHandler(createEvent)
            const createdItem = JSON.parse(createResponse.body)
 
            const getEvent = {
                body: null, 
                pathParameters: { id: createdItem.id }
            } as any 

            const getResponse = await getHandler(getEvent)
            const fetchedItem = JSON.parse(getResponse.body)

            for (const key of Object.keys(inputBody)) {
                expect(fetchedItem[key]).toEqual((inputBody as any)[key])
            }
        }),
        { numRuns: 100 }
    )
})