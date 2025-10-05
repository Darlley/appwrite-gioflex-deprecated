export default async function tokenGenerate() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const base64 = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64;
}
