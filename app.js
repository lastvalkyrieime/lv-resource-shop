
const API_URL = "https://script.google.com/macros/s/AKfycbx6OHbREYCYCx4xT0NKT0qKxK5q46Yz4Lo0jNCwU3hwgj7aRVx-Cfl1numE5Yl625xb/exec";

async function loadProducts() {
    const res = await fetch(API_URL + "?action=getProducts");
    const data = await res.json();
    let html = "";
    data.forEach(p => {
        html += `<div>
            <h3>${p.Nama} (Rp ${p.Harga})</h3>
            <p>${p.Deskripsi}</p>
            <button onclick="addToCart('${p.ID}', '${p.Nama}', ${p.Harga})">Add</button>
        </div>`;
    });
    document.getElementById("products").innerHTML = html;
}

let cart = [];

function addToCart(id,name,price){
    cart.push({id,name,price});
    renderCart();
}

function renderCart(){
    let html="";
    cart.forEach((c,i)=>{
        html+=`<div>${c.name} - Rp ${c.price}</div>`;
    });
    document.getElementById("cart").innerHTML=html;
}

async function checkout(){
    const buyer=prompt("Nama pembeli:");
    const note=prompt("Catatan:");
    const res = await fetch(API_URL, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            action:"checkout",
            buyer,
            note,
            cart
        })
    });
    alert("Order sent!");
}

loadProducts();
