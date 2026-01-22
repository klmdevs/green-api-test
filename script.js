 
function getFields(fields) {
  return fields.reduce((acc, fieldId) => {
    const element = document.getElementById(fieldId)
    if (element) {
      acc[fieldId] = element
    } else {
      printError(`Error: Element with id ${fieldId} not found`)
    }
    return acc
  }, {})
}

function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function printError(err) {
  const outputContent =  document.getElementById('outputContent')
  outputContent.value = err
}

function printResult(data) {
  const outputContent =  document.getElementById('outputContent')
  outputContent.value = JSON.stringify(data, null, 4)
}

function getAuthParams() {
  try {
    const { idInstance, apiTokenInstance } = getFields(['idInstance', 'apiTokenInstance'])

    if (!idInstance.value || !apiTokenInstance.value) throw new Error('Invalid auth credentials')

    return {
      idInstance: `waInstance${idInstance.value}`,
      apiTokenInstance: apiTokenInstance.value,
    }
  } catch (error) {
    printError(`Error: ${error.message}`)
  }
}

async function apiRequest(path, method = 'GET', data = null, headers = {}) {
  const apiOrigin = 'https://7107.api.greenapi.com'

  try {
    const url = new URL(path, apiOrigin).href
    console.log(url)

    const response = await fetch(url, {
      method,
      body: data ? JSON.stringify(data) : null,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      const error = new Error(`Status: ${response.status}`)
      error.details = errorData
      throw error
    }

    const body = await response.json()

    return body
  } catch (error) {
    const responseError = {
      message: error.message,
      details: error.details || 'No additional details',
    }

    printError(`Error: ${JSON.stringify(responseError, null, 4)}`)

    throw error
  }
}

async function getSettings() {
  const { idInstance, apiTokenInstance } = getAuthParams()
  const data = await apiRequest(`${idInstance}/getSettings/${apiTokenInstance}`)
  printResult(data)
}

async function getStateInstance() {
  const { idInstance, apiTokenInstance } = getAuthParams()
  const data = await apiRequest(`${idInstance}/getStateInstance/${apiTokenInstance}`)
  printResult(data)
}

async function sendMessage() {
  const { idInstance, apiTokenInstance } = getAuthParams()
  const { message, phoneNumber } = getFields(['message', 'phoneNumber'])
  const data = await apiRequest(`${idInstance}/sendMessage/${apiTokenInstance}`, 'POST', {
    chatId: phoneNumber.value + '@c.us',
    message: message.value,
  })
  printResult(data)
}

async function sendFileByUrl() {
  const { idInstance, apiTokenInstance } = getAuthParams()
  const { phoneNumber2,  fileUrl } = getFields(['phoneNumber2', 'fileUrl'])

  if (!isValidUrl(fileUrl.value)) return printError('Error: Invalid URL')

  const data = await apiRequest(`${idInstance}/sendFileByUrl/${apiTokenInstance}`, 'POST', {
    chatId: phoneNumber2.value + '@c.us',
    urlFile: fileUrl.value,
    fileName: fileUrl.value.split('/').pop() || 'file'
  })
  printResult(data)
}
