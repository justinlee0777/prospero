export function formatVariables(variables: Object): string {
  return Object.entries(variables).reduce(
    (str, [key, value]) => (str += `${key}: ${value}\n`),
    ''
  );
}
