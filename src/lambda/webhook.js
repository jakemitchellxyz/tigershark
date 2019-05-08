// Actual webhook logic over POST
const endpoint = async (body) => {
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)
    })

    // Return a success message
    return {
      statusCode: 200,
      body: "EVENT_RECEIVED"
    }
  }

  // Return not found exception if unhandled type
  return {
    statusCode: 404,
    body: "Not Found"
  }
}

// Verification endpoint over GET
const verification = async (queryParams) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "j2VfvW5Lrn-yCgS1l0gE4-q1PuQY5k3M"
    
  // Parse the query params
  let mode = queryParams['hub.mode']
  let token = queryParams['hub.verify_token']
  let challenge = queryParams['hub.challenge']
  
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED')

      // Return a message with the callenge
      return {
        statusCode: 200,
        body: challenge
      }
    }

    // Responds with '403 Forbidden' if verify tokens do not match
    return {
      statusCode: 404,
      body: "Not Found"
    }
  }

  return {
    statusCode: 200,
    body: "Welcome to GET"
  }
}

// Wrapper for the webhook handling
exports.handler = (event, context, callback) => {
  // Delegate work based on method
  if (event.httpMethod.toUpperCase() === "GET") {

    // Run the webhook verification method
    verification(event.queryStringParameters)
      .then(result => callback(null, result))
      .catch(error => callback(null, {
        statusCode: 500,
        body: error.toString()
      }))

  } else if (event.httpMethod.toUpperCase() === "POST") {

    // Hand off the parsing to the endpoint method
    endpoint(JSON.parse(event.body))
      .then(result => callback(null, result))
      .catch(error => callback(null, {
        statusCode: 500,
        body: error.toString()
      }))
  
  } else {
  
    // Finish the method and return the result
    callback(null, {
      statusCode: 400,
      body: "Invalid request method: " + event.httpMethod
    })
  
  }
}