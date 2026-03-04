export async function apiAttemptPost(apiBaseUrl, puzzleName, gameName, setPuzzleIdCallback) {
  const endpoint = `${apiBaseUrl}/attempt`;
  const body = {
    gameName: gameName,
    puzzleName: puzzleName,
  };
  console.log("Hitting endpoint", endpoint, body);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }

    const data = await response.json();

    // console.log('Puzzle Token:', data.id);
    setPuzzleIdCallback(puzzleName, data.id);
    // setPuzzleAttemptToken(puzzleName, data.id);
  } catch (error) {
    console.error(error);
  }
}

export async function apiAttemptCompletionPut(apiBaseUrl, token, time, statsCallback) {
  const endpoint = `${apiBaseUrl}/attempt/${token}/completion`;
  const body = {
    id: token,
    score: time,
  };
  console.log("Hitting endpoint", endpoint, body);
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if(response.status === 409) {
        apiAttemptCompletionGet(apiBaseUrl, token, statsCallback);
        return;
      }
      throw new Error(`HTTP status: ${response.status}`);
    }

    const data = await response.json();

    // console.log('Puzzle Stats:', data);
    statsCallback(data);
  } catch (error) {
    console.error(error);
  }
}

export async function apiAttemptCompletionGet(apiBaseUrl, token, statsCallback) {
  const endpoint = `${apiBaseUrl}/attempt/${token}/completion`;
  console.log("Hitting endpoint", endpoint);
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }

    const data = await response.json();

    // console.log('Puzzle Stats:', data);
    statsCallback(data);
  } catch (error) {
    console.error(error);
  }
}
