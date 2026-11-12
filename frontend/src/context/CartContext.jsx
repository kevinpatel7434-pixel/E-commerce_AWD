import { createContext,useContext,useMemo,useState } from 'react';
const CartContext=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>JSON.parse(localStorage.getItem('cart')||'[]'));
 const save=(next)=>{
    setItems(next);
    localStorage.setItem('cart',JSON.stringify(next));
};
 const add=(product,quantity=1)=>{
    if(product.stock<1)return; const old=items.find(x=>x._id===product._id); const next=old?items.map(x=>x._id===product._id?{...x,quantity:Math.min(x.quantity+quantity,product.stock)}:x):[...items,{...product,quantity:Math.min(quantity,product.stock)}];save(next)};
 const update=(id,quantity)=>{const p=items.find(x=>x._id===id);if(!p)return; save(items.map(x=>x._id===id?{...x,quantity:Math.max(1,Math.min(Number(quantity),x.stock))}:x));};
 const remove=id=>save(items.filter(x=>x._id!==id)); 
 const removeMany=ids=>save(items.filter(x=>!ids.includes(x._id)));
 const clear=()=>save([]);
 const total=useMemo(()=>items.reduce((s,x)=>s+x.price*x.quantity,0),[items]);
 return (
   <CartContext.Provider value={{items,add,update,remove,removeMany,clear,total,count:items.reduce((s,x)=>s+x.quantity,0)}}>
     {children}
   </CartContext.Provider>
 );
}
export const useCart=()=>useContext(CartContext);
