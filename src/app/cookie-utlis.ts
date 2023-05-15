export function getCookieValueFor(name : string){
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
  {

    // @ts-ignore
    return parts.pop().split(';').shift();
  }
  return null;
}

export function addCookie(key : string, value : string){
  document.cookie = key+"="+value+ ";";
}
