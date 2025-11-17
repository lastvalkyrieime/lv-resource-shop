const APPSCRIPT_URL = "PASTE_WEB_APP_URL";

// fetch products
async function loadProducts(){
  const res = await fetch(APPSCRIPT_URL + "?action=getProducts");
  const data = await res.json();
  document.getElementById("app").innerHTML = JSON.stringify(data);
}
loadProducts();
