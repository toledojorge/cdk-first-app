const AWS = require('aws-sdk');
const dynamoService = new AWS.DynamoDB();
const dynamoDocumentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.GREETINGS_TABLE;

exports.saveHello = async (event) => {
    console.log('save hello mod');
    console.log(event);
    const name = event.queryStringParameters.name;
    const item = {
        id: name,
        name: name,
        date: Date.now()
    }
    const savedItem = await saveItem(item);

    return {
        statusCode: 200,
        body: JSON.stringify(savedItem)
    }
}

exports.getHello = async (event) => {
    const name = event.queryStringParameters.name;
    const item = await getItemByName(name);
    console.log(item)
    return {
        statusCode: 200,
        body: JSON.stringify(item)
    }
}

async function saveItem(item) {
    const params = {
        TableName: TABLE_NAME,
        Item: item
    }
    return dynamoDocumentClient.put(params).promise().then(() => {
        return item;
    });
}

async function getItemByName(name) {
    var params = {
        Key: {
            "id": { "S": name }
        },
        TableName: TABLE_NAME
    };
    var item = await dynamoService.getItem(params).promise();
    return item;
}