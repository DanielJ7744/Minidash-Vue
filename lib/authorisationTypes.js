/**
 * Format the authentication type name for a system
 *
 * @param {String} authenticationType
 * @returns {String}
 */
const formatAuthenticationTypeName = (authenticationType) => {
  if (authenticationType.includes('oauth')) {
    return authenticationType.replace(/oauth/, 'oAuth ').replace('_', '')
  }

  const splitAuthType = authenticationType.split('_')

  if (splitAuthType.length === 1) {
    return splitAuthType.join(' ').toUpperCase()
  }

  splitAuthType.forEach((word, index) => {
    const splitWord = word.split('')
    splitWord[0] = splitWord[0].toUpperCase()
    splitAuthType[index] = splitWord.join('')
  })

  return splitAuthType.join(' ')
}

export {
  formatAuthenticationTypeName
}
