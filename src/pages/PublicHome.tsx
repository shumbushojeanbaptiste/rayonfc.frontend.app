// src/pages/PublicHome.tsx 
import { Link } from "react-router-dom";
import Trendsvideos from "./Trendsvideos";
import Freevideos from "./Freevideos";

export default function PublicHome() {
  return (
   
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to OleePlay</h1>
      <p className="mb-6 text-gray-500">
        Sign in to access your dashboard
      </p>
      <div className="flex gap-4">
        <Link to="/auth/signin" className="rounded bg-green-950 px-6 py-2 text-white">
          Sign In
        </Link>
        <Link to="/auth/signup" className="rounded border px-6 py-2">
          Sign Up
        </Link>
        
      </div>
      
      <div>
       <Trendsvideos/>
       
      </div>
       
    </div>

   
    
  );
}
