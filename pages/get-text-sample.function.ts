export default async function getTextSample(): Promise<string> {
  const response = await fetch('../text-samples/color-example.txt');
  return await response.text();
}
