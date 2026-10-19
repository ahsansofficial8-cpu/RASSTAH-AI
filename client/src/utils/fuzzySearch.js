function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function editDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previousDiagonal = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        previousDiagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
      previousDiagonal = previous;
    }
  }

  return row[right.length];
}

function tokenMatches(queryToken, candidateToken) {
  if (candidateToken === queryToken) return true;
  if (queryToken.length >= 3 && candidateToken.length >= 3
    && (candidateToken.includes(queryToken) || queryToken.includes(candidateToken))) return true;
  if (queryToken.length < 4 || candidateToken.length < 4) return false;

  const allowedDistance = queryToken.length >= 7 ? 2 : 1;
  return editDistance(queryToken, candidateToken) <= allowedDistance;
}

export function fuzzySearchLocations(locations, query) {
  const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return locations;

  return locations
    .map((location) => {
      const searchableText = normalize([
        location.name,
        location.region,
        location.whyFamous,
        location.whatsUnique
      ].filter(Boolean).join(' '));
      const candidateTokens = [...new Set(searchableText.split(/\s+/).filter(Boolean))];
      let score = 0;

      for (const queryToken of queryTokens) {
        const matches = candidateTokens
          .filter((candidateToken) => tokenMatches(queryToken, candidateToken))
          .sort((left, right) => editDistance(queryToken, left) - editDistance(queryToken, right));
        if (matches.length === 0) return null;
        score += matches[0] === queryToken ? 0 : editDistance(queryToken, matches[0]);
      }

      return { location, score };
    })
    .filter(Boolean)
    .sort((left, right) => left.score - right.score)
    .map(({ location }) => location);
}
