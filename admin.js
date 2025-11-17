
const API_URL="https://script.google.com/macros/s/AKfycbx6OHbREYCYCx4xT0NKT0qKxK5q46Yz4Lo0jNCwU3hwgj7aRVx-Cfl1numE5Yl625xb/exec";
let logged=false;

function login(){
    const u=document.getElementById("user").value;
    const p=document.getElementById("pass").value;
    if(u==="admin" && p==="lvime2025"){
        logged=true;
        document.getElementById("login").style.display="none";
        document.getElementById("panel").style.display="block";
        load();
    } else alert("Wrong login");
}

async function load(){
    const res=await fetch(API_URL+"?action=getProducts");
    const data=await res.json();
    let html="";
    data.forEach(p=>{
        html+=`<div>
            <b>${p.Nama}</b> - Stock: ${p.Stok}
            <button onclick="del('${p.ID}')">Delete</button>
        </div>`;
    });
    document.getElementById("plist").innerHTML=html;
}

async function addProduct(){
    const body={ action:"addProduct",
        Nama:document.getElementById("pname").value,
        Kategori:document.getElementById("pcat").value,
        Harga:document.getElementById("pprice").value,
        Stok:document.getElementById("pstock").value,
        Deskripsi:document.getElementById("pdesc").value
    };
    await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
    });
    load();
}

async function del(id){
    await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"deleteProduct",id})
    });
    load();
}

function logout(){
    location.reload();
}
