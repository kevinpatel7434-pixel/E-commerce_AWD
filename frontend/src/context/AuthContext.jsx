import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('user')||'null'));
  const login=async(data)=>{
    const r=await api.post('/auth/login',data);
     localStorage.setItem('token',r.data.token);
     localStorage.setItem('user',JSON.stringify(r.data.user));
     setUser(r.data.user);
     return r.data.user;
    };
  const register=async(data)=>{
    const r=await api.post('/auth/register',data); 
    localStorage.setItem('token',r.data.token); 
    localStorage.setItem('user',JSON.stringify(r.data.user)); 
    setUser(r.data.user);
  };
  const logout=()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  useEffect(()=>{
    if(localStorage.getItem('token')) api.get('/auth/me').then(r=>setUser(r.data.user)).catch(logout)},[]);
  return(
   <AuthContext.Provider value={{user,login,register,logout}}>
    {children}
    </AuthContext.Provider>
    )
}
export const useAuth=()=>useContext(AuthContext);
