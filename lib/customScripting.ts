import plans from '@/enums/Plans';

const getEditorCustomScriptLanguage = (scriptLanguage) => {
  switch (scriptLanguage) {
    case 'node':
    case 'node16':
    case 'node17':
      return 'javascript'
    case 'php':
    case 'php7':
    case 'php8':
      return 'php'
    case 'python':
    case 'python3':
      return 'python'
    case 'java':
    case 'java11':
      return 'java'
    default:
      return scriptLanguage
  }
}

const plansWithCustomScripting: [string, ...string[]] = [plans.PROFESSIONAL, plans.ENTERPRISE]

export {
  getEditorCustomScriptLanguage,
  plansWithCustomScripting
}
