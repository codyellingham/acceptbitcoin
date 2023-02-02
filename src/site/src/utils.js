export function generateRandomId() {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0].toString();
}

export function setUserId() {
  const cookie = document.cookie.replace(/(?:(?:^|.*;\s*)acceptbitcoin\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if(!cookie) {
    const userId = generateRandomId();
    document.cookie = "acceptbitcoin=" + JSON.stringify({userId}) + ";SameSite=Strict;Secure;";
  }
}
