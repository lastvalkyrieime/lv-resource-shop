const APPSCRIPT_URL = " https://lastvalkyrieime.github.io/lv-resource-shop/";

// fetch products
async function loadProducts(){
  const res = await fetch(APPSCRIPT_URL + "?action=getProducts");
  const data = await res.json();
  document.getElementById("app").innerHTML = JSON.stringify(data);
}
loadProducts();
